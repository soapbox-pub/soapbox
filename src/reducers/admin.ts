import { produce, type Draft } from 'immer';

import {
  ADMIN_CONFIG_FETCH_SUCCESS,
  ADMIN_CONFIG_UPDATE_SUCCESS,
  ADMIN_REPORTS_FETCH_SUCCESS,
  ADMIN_REPORTS_PATCH_REQUEST,
  ADMIN_REPORTS_PATCH_SUCCESS,
  ADMIN_USERS_FETCH_SUCCESS,
  ADMIN_USERS_DELETE_REQUEST,
  ADMIN_USERS_DELETE_SUCCESS,
  ADMIN_USERS_APPROVE_REQUEST,
  ADMIN_USERS_APPROVE_SUCCESS,
  ADMIN_USERS_REJECT_REQUEST,
  ADMIN_USERS_REJECT_SUCCESS,
} from '@/actions/admin.ts';
import { normalizeAdminReport, normalizeAdminAccount } from '@/normalizers/index.ts';
import { normalizeId } from '@/utils/normalizers.ts';

import type { APIEntity } from '@/types/entities.ts';
import type { Config } from '@/utils/config-db.ts';
import type { AnyAction } from 'redux';

interface State {
  reports: Record<string, ReducerAdminReport>;
  openReports: string[];
  users: Record<string, ReducerAdminAccount>;
  latestUsers: string[];
  awaitingApproval: string[];
  configs: Config[];
  needsReboot: boolean;
}

const initialState: State = {
  reports: {},
  openReports: [],
  users: {},
  latestUsers: [],
  awaitingApproval: [],
  configs: [],
  needsReboot: false,
};

type AdminAccountRecord = ReturnType<typeof normalizeAdminAccount>;
type AdminReportRecord = ReturnType<typeof normalizeAdminReport>;

export interface ReducerAdminAccount extends Omit<AdminAccountRecord, 'account'> {
  account: string | null;
}

export interface ReducerAdminReport extends Omit<AdminReportRecord, 'account' | 'target_account' | 'action_taken_by_account' | 'assigned_account' | 'statuses'> {
  account: string | null;
  target_account: string | null;
  action_taken_by_account: string | null;
  assigned_account: string | null;
  statuses: (string | null)[];
}

type SetKeys = 'openReports' | 'latestUsers' | 'awaitingApproval';

type APIReport = { id: string; state: string; statuses: any[] };
type APIUser = { id: string; email: string; nickname: string; registration_reason: string };

type Filters = Record<string, boolean>;

const toIds = (items: any[]): string[] => items.map(item => item.id);

const addToSet = (draft: Draft<State>, key: SetKeys, ids: string[]) => {
  draft[key] = [...new Set([...draft[key], ...ids])];
};

const removeFromSet = (draft: Draft<State>, key: SetKeys, id: string) => {
  draft[key] = draft[key].filter(item => item !== id);
};

const maybeImportUnapproved = (draft: Draft<State>, users: APIUser[], filters: Filters) => {
  if (filters.pending) {
    addToSet(draft, 'awaitingApproval', toIds(users));
  }
};

const maybeImportLatest = (draft: Draft<State>, users: APIUser[], filters: Filters, page: number) => {
  if (page === 1 && !filters.pending) {
    draft.latestUsers = [...new Set(toIds(users))];
  }
};

/** Replace an embedded entity with its ID. */
const minifyEmbedded = (entity: unknown): string | null => {
  if (typeof entity === 'string') return entity;
  return normalizeId((entity as { id?: unknown } | null)?.id);
};

const fixUser = (user: APIEntity): ReducerAdminAccount => {
  const normalized = normalizeAdminAccount(user);

  return {
    ...normalized,
    account: minifyEmbedded(normalized.account),
  };
};

function importUsers(state: State, users: APIUser[], filters: Filters, page: number): State {
  return produce(state, draft => {
    maybeImportUnapproved(draft, users, filters);
    maybeImportLatest(draft, users, filters, page);

    users.forEach(user => {
      draft.users[user.id] = fixUser(user);
    });
  });
}

function deleteUser(state: State, accountId: string): State {
  return produce(state, draft => {
    removeFromSet(draft, 'awaitingApproval', accountId);
    delete draft.users[accountId];
  });
}

function approveUser(state: State, user: APIUser): State {
  return produce(state, draft => {
    removeFromSet(draft, 'awaitingApproval', user.id);
    draft.users[user.id] = fixUser(user);
  });
}

const fixReport = (report: APIEntity): ReducerAdminReport => {
  const normalized = normalizeAdminReport(report);

  return {
    ...normalized,
    account: minifyEmbedded(normalized.account),
    target_account: minifyEmbedded(normalized.target_account),
    action_taken_by_account: minifyEmbedded(normalized.action_taken_by_account),
    assigned_account: minifyEmbedded(normalized.assigned_account),
    statuses: normalized.statuses.map((status) => minifyEmbedded(status)),
  };
};

function importReports(state: State, reports: APIEntity[]): State {
  return produce(state, draft => {
    reports.forEach(report => {
      const normalizedReport = fixReport(report);
      if (!normalizedReport.action_taken) {
        addToSet(draft, 'openReports', [report.id]);
      }
      draft.reports[report.id] = normalizedReport;
    });
  });
}

function handleReportDiffs(state: State, reports: APIReport[]): State {
  // Note: the reports here aren't full report objects
  // hence the need for a new function.
  return produce(state, draft => {
    reports.forEach(report => {
      switch (report.state) {
        case 'open':
          addToSet(draft, 'openReports', [report.id]);
          break;
        default:
          removeFromSet(draft, 'openReports', report.id);
      }
    });
  });
}

const importConfigs = (state: State, configs: Config[]): State => {
  return { ...state, configs };
};

export default function admin(state: State = initialState, action: AnyAction): State {
  switch (action.type) {
    case ADMIN_CONFIG_FETCH_SUCCESS:
    case ADMIN_CONFIG_UPDATE_SUCCESS:
      return importConfigs(state, action.configs);
    case ADMIN_REPORTS_FETCH_SUCCESS:
      return importReports(state, action.reports);
    case ADMIN_REPORTS_PATCH_REQUEST:
    case ADMIN_REPORTS_PATCH_SUCCESS:
      return handleReportDiffs(state, action.reports);
    case ADMIN_USERS_FETCH_SUCCESS:
      return importUsers(state, action.accounts, action.filters, action.page);
    case ADMIN_USERS_DELETE_REQUEST:
    case ADMIN_USERS_DELETE_SUCCESS:
    case ADMIN_USERS_REJECT_REQUEST:
    case ADMIN_USERS_REJECT_SUCCESS:
      return deleteUser(state, action.accountId);
    case ADMIN_USERS_APPROVE_REQUEST:
      return produce(state, draft => removeFromSet(draft, 'awaitingApproval', action.accountId));
    case ADMIN_USERS_APPROVE_SUCCESS:
      return approveUser(state, action.user);
    default:
      return state;
  }
}
