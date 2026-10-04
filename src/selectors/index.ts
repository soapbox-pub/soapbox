import { createSelector } from 'reselect';

import { getSettings } from '@/actions/settings.ts';
import { Entities } from '@/entity-store/entities.ts';
import { type MRFSimple } from '@/schemas/pleroma.ts';
import { getDomain } from '@/utils/accounts.ts';
import ConfigDB from '@/utils/config-db.ts';
import { getFeatures } from '@/utils/features.ts';
import { shouldFilter } from '@/utils/timelines.ts';

import type { EntityStore } from '@/entity-store/types.ts';
import type { ContextType } from '@/normalizers/filter.ts';
import type { ReducerNotification } from '@/reducers/notifications.ts';
import type { Account as AccountSchema } from '@/schemas/index.ts';
import type { RootState } from '@/store.ts';
import type { Account, Attachment, Filter as FilterEntity, Status } from '@/types/entities.ts';

const normalizeId = (id: any): string => typeof id === 'string' ? id : '';

export function selectAccount(state: RootState, accountId: string) {
  return state.entities[Entities.ACCOUNTS]?.store[accountId] as AccountSchema | undefined;
}

export function selectOwnAccount(state: RootState) {
  if (state.me) {
    return selectAccount(state, state.me);
  }
}

export const accountIdsToAccts = (state: RootState, ids: string[]) => ids.map((id) => selectAccount(state, id)!.acct);

const getAccountBase         = (state: RootState, id: string) => state.entities[Entities.ACCOUNTS]?.store[id] as Account | undefined;
const getAccountRelationship = (state: RootState, id: string) => state.relationships[id];
const getAccountMeta         = (state: RootState, id: string) => state.accounts_meta[id];

export const makeGetAccount = () => {
  return createSelector([
    getAccountBase,
    getAccountRelationship,
    getAccountMeta,
  ], (account, relationship, meta) => {
    if (!account) return null;
    return {
      ...account,
      relationship,
      source: meta?.source ?? account.source,
      pleroma: meta?.pleroma ?? account.pleroma,
    };
  });
};

const toServerSideType = (columnType: string): ContextType => {
  switch (columnType) {
    case 'home':
    case 'notifications':
    case 'public':
    case 'thread':
      return columnType;
    default:
      if (columnType.includes('list:')) {
        return 'home';
      } else {
        return 'public'; // community, account, hashtag
      }
  }
};

type FilterContext = { contextType?: string };

export const getFilters = (state: RootState, query: FilterContext) => {
  return state.filters.filter((filter) => {
    return (!query?.contextType || filter.context.includes(toServerSideType(query.contextType)))
      && (filter.expires_at === null || Date.parse(filter.expires_at) > new Date().getTime());
  });
};

const escapeRegExp = (string: string) =>
  string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string

export const regexFromFilters = (filters: FilterEntity[]) => {
  if (filters.length === 0) return null;

  return new RegExp(filters.map(filter =>
    filter.keywords.map(keyword => {
      let expr = escapeRegExp(keyword.keyword);

      if (keyword.whole_word) {
        if (/^[\w]/.test(expr)) {
          expr = `\\b${expr}`;
        }

        if (/[\w]$/.test(expr)) {
          expr = `${expr}\\b`;
        }
      }

      return expr;
    }).join('|'),
  ).join('|'), 'i');
};

const checkFiltered = (index: string, filters: FilterEntity[]): string[] =>
  filters.reduce<string[]>((result, filter) =>
    result.concat(filter.keywords.reduce<string[]>((result, keyword) => {
      let expr = escapeRegExp(keyword.keyword);

      if (keyword.whole_word) {
        if (/^[\w]/.test(expr)) {
          expr = `\\b${expr}`;
        }

        if (/[\w]$/.test(expr)) {
          expr = `${expr}\\b`;
        }
      }

      const regex = new RegExp(expr);

      if (regex.test(index)) return result.concat(filter.title);
      return result;
    }, [])), []);

type APIStatus = { id: string; username?: string };

export const makeGetStatus = () => {
  return createSelector(
    [
      (state: RootState, { id }: APIStatus) => state.statuses[id],
      (state: RootState, { id }: APIStatus) => state.statuses[state.statuses[id]?.reblog || ''],
      (_state: RootState, { username }: APIStatus) => username,
      getFilters,
      (state: RootState) => state.me,
      (state: RootState) => getFeatures(state.instance),
    ],

    (statusBase, statusReblog, username, filters, me, features): Status | null => {
      if (!statusBase) return null;
      const { account } = statusBase;

      if (!account) return null;

      const accountUsername = account.acct;

      // Must be owner of status if username exists.
      if (accountUsername !== username && username !== undefined) {
        return null;
      }

      const status: Status = {
        ...statusBase,
        reblog: (statusReblog as Status | undefined) || null,
      };

      if ((features.filters) && account.id !== me) {
        status.filtered = checkFiltered(statusReblog?.search_index || statusBase.search_index, filters);
      }

      return status;
    },
  );
};

export const makeGetNotification = () => {
  return createSelector([
    (_state: RootState, notification: ReducerNotification) => notification,
    (state: RootState, notification: ReducerNotification) => selectAccount(state, normalizeId(notification.account)),
    (state: RootState, notification: ReducerNotification) => selectAccount(state, normalizeId(notification.target)),
    (state: RootState, notification: ReducerNotification) => state.statuses[normalizeId(notification.status)],
  ], (notification, account, target, status) => {
    return {
      ...notification,
      account: account || null,
      target: target || null,
      status: status || null,
    };
  });
};

const emptyIds: string[] = [];

export const getAccountGallery = createSelector([
  (state: RootState, id: string) => state.timelines[`account:${id}:media`]?.items || emptyIds,
  (state: RootState) => state.statuses,
], (statusIds, statuses) => {
  return statusIds.reduce<Attachment[]>((medias, statusId) => {
    const status = statuses[statusId];
    if (!status) return medias;
    if (status.reblog) return medias;

    return medias.concat(
      status.media_attachments.map(media => ({ ...media, status, account: status.account })));
  }, []);
});

export const getGroupGallery = createSelector([
  (state: RootState, id: string) => state.timelines[`group:${id}:media`]?.items || emptyIds,
  (state: RootState) => state.statuses,
], (statusIds, statuses) => {
  return statusIds.reduce<Attachment[]>((medias, statusId) => {
    const status = statuses[statusId];
    if (!status) return medias;
    if (status.reblog) return medias;

    return medias.concat(
      status.media_attachments.map(media => ({ ...media, status, account: status.account })));
  }, []);
});

export const makeGetReport = () => {
  const getStatus = makeGetStatus();

  return createSelector(
    [
      (state: RootState, id: string) => state.admin.reports[id],
      (state: RootState, id: string) => selectAccount(state, state.admin.reports[id]?.account || ''),
      (state: RootState, id: string) => selectAccount(state, state.admin.reports[id]?.target_account || ''),
      (state: RootState, id: string) => (state.admin.reports[id]?.statuses ?? [])
        .map(statusId => state.statuses[normalizeId(statusId)])
        .filter((s): s is NonNullable<typeof s> => !!s)
        .map((s) => getStatus(state, s))
        .filter((s): s is Status => !!s),
    ],

    (report, account, targetAccount, statuses) => {
      if (!report) return null;
      return {
        ...report,
        account,
        target_account: targetAccount,
        statuses,
      };
    },
  );
};

export function makeGetOtherAccounts() {
  return createSelector([
    (state: RootState) => state.entities[Entities.ACCOUNTS]?.store as EntityStore<AccountSchema>,
    (state: RootState) => state.auth.users,
    (state: RootState) => state.me,
  ],
  (store, authUsers, me): AccountSchema[] => {
    const accountIds = Object.values(authUsers).map((authUser) => authUser.id);

    return accountIds.reduce<AccountSchema[]>((accounts, id: string) => {
      if (id === me) return accounts;

      const account = store[id];
      if (account) {
        accounts.push(account);
      }

      return accounts;
    }, []);
  });
}

const getSimplePolicy = createSelector([
  (state: RootState) => state.admin.configs,
  (state: RootState) => state.instance.pleroma.metadata.federation.mrf_simple,
], (configs, instancePolicy) => {
  return {
    ...instancePolicy,
    ...ConfigDB.toSimplePolicy(configs),
  };
});

const getRemoteInstanceFavicon = (state: RootState, host: string) => {
  const accounts = (state.entities[Entities.ACCOUNTS]?.store ?? {}) as EntityStore<AccountSchema>;
  const account = Object.entries(accounts).find(([_, account]) => account && getDomain(account) === host)?.[1];
  return account?.pleroma?.favicon;
};

export type HostFederation = {
  [key in keyof MRFSimple]: boolean;
};

const getRemoteInstanceFederation = (state: RootState, host: string): HostFederation => {
  const simplePolicy = getSimplePolicy(state);

  return Object.fromEntries(
    Object.entries(simplePolicy).map(([key, hosts]) => [key, hosts.includes(host)]),
  ) as HostFederation;
};


export const makeGetHosts = () => {
  return createSelector([getSimplePolicy], (simplePolicy) => {
    const { accept, reject_deletes, report_removal, ...rest } = simplePolicy;

    return [...new Set(Object.values(rest).flat())].sort();
  });
};

export interface RemoteInstance {
  host: string;
  favicon: string | null;
  federation: HostFederation;
}

export const makeGetRemoteInstance = () =>
  createSelector([
    (_state: RootState, host: string) => host,
    getRemoteInstanceFavicon,
    getRemoteInstanceFederation,
  ], (host, favicon, federation): RemoteInstance => ({
    host,
    favicon: favicon ?? null,
    federation,
  }));

type ColumnQuery = { type: string; prefix?: string };

const emptySettings = {};

export const makeGetStatusIds = () => createSelector([
  (state: RootState, { type, prefix }: ColumnQuery) => getSettings(state)[prefix || type] ?? emptySettings,
  (state: RootState, { type }: ColumnQuery) => state.timelines[type]?.items || emptyIds,
  (state: RootState) => state.statuses,
], (columnSettings: any, statusIds: string[], statuses) => {
  return statusIds.filter((id: string) => {
    const status = statuses[id];
    if (!status) return true;
    return !shouldFilter(status, columnSettings);
  });
});
