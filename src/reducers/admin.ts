import {
  Map as ImmutableMap,
  List as ImmutableList,
  Record as ImmutableRecord,
  OrderedSet as ImmutableOrderedSet,
  fromJS,
} from 'immutable';

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
} from 'soapbox/actions/admin.ts';
import { normalizeAdminReport, normalizeAdminAccount } from 'soapbox/normalizers/index.ts';
import { normalizeId } from 'soapbox/utils/normalizers.ts';

import type { AnyAction } from 'redux';
import type { APIEntity } from 'soapbox/types/entities.ts';
import type { Config } from 'soapbox/utils/config-db.ts';

const ReducerRecord = ImmutableRecord({
  reports: ImmutableMap<string, ReducerAdminReport>(),
  openReports: ImmutableOrderedSet<string>(),
  users: ImmutableMap<string, ReducerAdminAccount>(),
  latestUsers: ImmutableOrderedSet<string>(),
  awaitingApproval: ImmutableOrderedSet<string>(),
  configs: ImmutableList<Config>(),
  needsReboot: false,
});

type State = ReturnType<typeof ReducerRecord>;

type AdminAccountRecord = ReturnType<typeof normalizeAdminAccount>;
type AdminReportRecord = ReturnType<typeof normalizeAdminReport>;

export interface ReducerAdminAccount extends AdminAccountRecord {
  account: string | null;
}

export interface ReducerAdminReport extends AdminReportRecord {
  account: string | null;
  target_account: string | null;
  action_taken_by_account: string | null;
  assigned_account: string | null;
  statuses: ImmutableList<string | null>;
}

// Lol https://javascript.plainenglish.io/typescript-essentials-conditionally-filter-types-488705bfbf56
type FilterConditionally<Source, Condition> = Pick<Source, {[K in keyof Source]: Source[K] extends Condition ? K : never}[keyof Source]>;

type SetKeys = keyof FilterConditionally<State, ImmutableOrderedSet<string>>;

type APIReport = { id: string; state: string; statuses: any[] };
type APIUser = { id: string; email: string; nickname: string; registration_reason: string };

type Filters = Record<string, boolean>;

const toIds = (items: any[]) => items.map(item => item.id);

const mergeSet = (state: State, key: SetKeys, users: APIUser[]): State => {
  const newIds = toIds(users);
  return state.update(key, (ids: ImmutableOrderedSet<string>) => ids.union(newIds));
};

const replaceSet = (state: State, key: SetKeys, users: APIUser[]): State => {
  const newIds = toIds(users);
  return state.set(key, ImmutableOrderedSet(newIds));
};

const maybeImportUnapproved = (state: State, users: APIUser[], filters: Filters): State => {
  if (filters.pending) {
    return mergeSet(state, 'awaitingApproval', users);
  } else {
    return state;
  }
};

const maybeImportLatest = (state: State, users: APIUser[], filters: Filters, page: number): State => {
  if (page === 1 && !filters.pending) {
    return replaceSet(state, 'latestUsers', users);
  } else {
    return state;
  }
};

const minifyUser = (user: AdminAccountRecord): ReducerAdminAccount => {
  return user.mergeWith((o, n) => n || o, {
    account: normalizeId(user.getIn(['account', 'id'])),
  }) as ReducerAdminAccount;
};

const fixUser = (user: APIEntity): ReducerAdminAccount => {
  return normalizeAdminAccount(user).withMutations(user => {
    minifyUser(user);
  }) as ReducerAdminAccount;
};

function importUsers(state: State, users: APIUser[], filters: Filters, page: number): State {
  return state.withMutations(state => {
    maybeImportUnapproved(state, users, filters);
    maybeImportLatest(state, users, filters, page);

    users.forEach(user => {
      const normalizedUser = fixUser(user);
      state.setIn(['users', user.id], normalizedUser);
    });
  });
}

function deleteUser(state: State, accountId: string): State {
  return state.withMutations(state => {
    state.update('awaitingApproval', orderedSet => orderedSet.delete(accountId));
    state.deleteIn(['users', accountId]);
  });
}

function approveUser(state: State, user: APIUser): State {
  const normalizedUser = fixUser(user);
  return state.withMutations(state => {
    state.update('awaitingApproval', orderedSet => orderedSet.delete(user.id));
    state.setIn(['users', user.id], normalizedUser);
  });
}

const minifyReport = (report: AdminReportRecord): ReducerAdminReport => {
  return report.mergeWith((o, n) => n || o, {
    account: normalizeId(report.getIn(['account', 'id'])),
    target_account: normalizeId(report.getIn(['target_account', 'id'])),
    action_taken_by_account: normalizeId(report.getIn(['action_taken_by_account', 'id'])),
    assigned_account: normalizeId(report.getIn(['assigned_account', 'id'])),
    statuses: report.get('statuses').map((status: any) => normalizeId(status.get('id'))),
  }) as ReducerAdminReport;
};

const fixReport = (report: APIEntity): ReducerAdminReport => {
  return normalizeAdminReport(report).withMutations(report => {
    minifyReport(report);
  }) as ReducerAdminReport;
};

function importReports(state: State, reports: APIEntity[]): State {
  return state.withMutations(state => {
    reports.forEach(report => {
      const normalizedReport = fixReport(report);
      if (!normalizedReport.action_taken) {
        state.update('openReports', orderedSet => orderedSet.add(report.id));
      }
      state.setIn(['reports', report.id], normalizedReport);
    });
  });
}

function handleReportDiffs(state: State, reports: APIReport[]) {
  // Note: the reports here aren't full report objects
  // hence the need for a new function.
  return state.withMutations(state => {
    reports.forEach(report => {
      switch (report.state) {
        case 'open':
          state.update('openReports', orderedSet => orderedSet.add(report.id));
          break;
        default:
          state.update('openReports', orderedSet => orderedSet.delete(report.id));
      }
    });
  });
}

const normalizeConfig = (config: any): Config => ImmutableMap(fromJS(config));

const normalizeConfigs = (configs: any): ImmutableList<Config> => {
  return ImmutableList(fromJS(configs)).map(normalizeConfig);
};

const importConfigs = (state: State, configs: any): State => {
  return state.set('configs', normalizeConfigs(configs));
};

export default function admin(state: State = ReducerRecord(), action: AnyAction): State {
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
      return state.update('awaitingApproval', set => set.remove(action.accountId));
    case ADMIN_USERS_APPROVE_SUCCESS:
      return approveUser(state, action.user);
    default:
      return state;
  }
}
