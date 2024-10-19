import { produce } from 'immer';

import {
  ADMIN_USERS_TAG_REQUEST,
  ADMIN_USERS_TAG_SUCCESS,
  ADMIN_USERS_TAG_FAIL,
  ADMIN_USERS_UNTAG_REQUEST,
  ADMIN_USERS_UNTAG_SUCCESS,
  ADMIN_USERS_UNTAG_FAIL,
  ADMIN_ADD_PERMISSION_GROUP_REQUEST,
  ADMIN_ADD_PERMISSION_GROUP_SUCCESS,
  ADMIN_ADD_PERMISSION_GROUP_FAIL,
  ADMIN_REMOVE_PERMISSION_GROUP_REQUEST,
  ADMIN_REMOVE_PERMISSION_GROUP_SUCCESS,
  ADMIN_REMOVE_PERMISSION_GROUP_FAIL,
  ADMIN_USERS_DELETE_REQUEST,
  ADMIN_USERS_DELETE_FAIL,
  ADMIN_USERS_DEACTIVATE_REQUEST,
  ADMIN_USERS_DEACTIVATE_FAIL,
} from 'soapbox/actions/admin';
import { CHATS_FETCH_SUCCESS, CHATS_EXPAND_SUCCESS, CHAT_FETCH_SUCCESS } from 'soapbox/actions/chats';
import {
  ACCOUNT_IMPORT,
  ACCOUNTS_IMPORT,
  ACCOUNT_FETCH_FAIL_FOR_USERNAME_LOOKUP,
} from 'soapbox/actions/importer';
import { STREAMING_CHAT_UPDATE } from 'soapbox/actions/streaming';
import { Account, accountSchema } from 'soapbox/schemas';

import type { AnyAction } from 'redux';

export interface ReducerAccount extends Omit<Account, 'moved'> {
  moved: string | null;
}

type State = Record<string, ReducerAccount>;

const initialState: State = {};

/** Convert sub-entities into string IDs (or null). */
function minifyAccount(account: Account): ReducerAccount {
  return { ...account, moved: account.moved?.id ?? null };
}

/** Parse account data, and import valid accounts into the state. */
function fixAccount(state: State, data: unknown): State {
  const result = accountSchema.safeParse(data);

  if (!result.success) {
    return state;
  }

  const account = result.data;
  const normalized = minifyAccount(account);

  return { ...state, [normalized.id]: normalized };
}

/** Import valid accounts into the state. */
function normalizeAccounts(state: State, data: unknown[]): State {
  return produce(state, draft => {
    data.forEach((item) => fixAccount(draft, item));
  });
}

function importAccountFromChat(state: State, chat: any): State {
  return fixAccount(state, chat.account);
}

function importAccountsFromChats(state: State, chats: unknown[]): State {
  return produce(state, draft => {
    chats.forEach(chat => importAccountFromChat(draft, chat));
  });
}

function addTags(state: State, accountIds: string[], tags: string[]): State {
  return produce(state, draft => {
    for (const id of accountIds) {
      const account = draft[id];
      if (!account) continue;

      const tagSet = new Set([...account.pleroma.tags, ...tags]);
      account.pleroma.tags = [...tagSet];

      if (tagSet.has('verified')) {
        account.verified = true;
      }
    }
  });
}

function removeTags (state: State, accountIds: string[], tags: string[]): State {
  return produce(state, draft => {
    for (const id of accountIds) {
      const account = draft[id];
      if (!account) continue;

      const tagSet = new Set(account.pleroma.tags).difference(new Set(tags));
      account.pleroma.tags = [...tagSet];

      if (tagSet.has('verified')) {
        account.verified = false;
      }
    }
  });
}

function setActive(state: State, accountIds: Array<string>, active: boolean): State {
  return produce(state, draft => {
    for (const id of accountIds) {
      const account = draft[id];
      if (!account) continue;

      account.pleroma.deactivated = !active;
    }
  });
}

function setPermission(state: State, accountIds: string[], permissionGroup: string, value: boolean): State {
  return produce(state, draft => {
    for (const id of accountIds) {
      const account = draft[id];
      if (!account) continue;

      switch (permissionGroup) {
        case 'admin':
          account.pleroma.is_admin = value;
          break;
        case 'moderator':
          account.pleroma.is_moderator = value;
          break;
      }
    }
  });
}

export default function accounts(state: State = initialState, action: AnyAction): State {
  switch (action.type) {
    case ACCOUNT_IMPORT:
      return fixAccount(state, action.account);
    case ACCOUNTS_IMPORT:
      return normalizeAccounts(state, action.accounts);
    case ACCOUNT_FETCH_FAIL_FOR_USERNAME_LOOKUP:
      return fixAccount(state, { id: -1, username: action.username });
    case CHATS_FETCH_SUCCESS:
    case CHATS_EXPAND_SUCCESS:
      return importAccountsFromChats(state, action.chats);
    case CHAT_FETCH_SUCCESS:
    case STREAMING_CHAT_UPDATE:
      return importAccountsFromChats(state, [action.chat]);
    case ADMIN_USERS_TAG_REQUEST:
    case ADMIN_USERS_TAG_SUCCESS:
    case ADMIN_USERS_UNTAG_FAIL:
      return addTags(state, action.accountIds, action.tags);
    case ADMIN_USERS_UNTAG_REQUEST:
    case ADMIN_USERS_UNTAG_SUCCESS:
    case ADMIN_USERS_TAG_FAIL:
      return removeTags(state, action.accountIds, action.tags);
    case ADMIN_ADD_PERMISSION_GROUP_REQUEST:
    case ADMIN_ADD_PERMISSION_GROUP_SUCCESS:
    case ADMIN_REMOVE_PERMISSION_GROUP_FAIL:
      return setPermission(state, action.accountIds, action.permissionGroup, true);
    case ADMIN_REMOVE_PERMISSION_GROUP_REQUEST:
    case ADMIN_REMOVE_PERMISSION_GROUP_SUCCESS:
    case ADMIN_ADD_PERMISSION_GROUP_FAIL:
      return setPermission(state, action.accountIds, action.permissionGroup, false);
    case ADMIN_USERS_DELETE_REQUEST:
    case ADMIN_USERS_DEACTIVATE_REQUEST:
      return setActive(state, action.accountIds, false);
    case ADMIN_USERS_DELETE_FAIL:
    case ADMIN_USERS_DEACTIVATE_FAIL:
      return setActive(state, action.accountIds, true);
    default:
      return state;
  }
}
