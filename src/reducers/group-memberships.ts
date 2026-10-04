import { produce, type Draft } from 'immer';

import {
  GROUP_DELETE_SUCCESS,
  GROUP_MEMBERSHIPS_FETCH_REQUEST,
  GROUP_MEMBERSHIPS_FETCH_FAIL,
  GROUP_MEMBERSHIPS_FETCH_SUCCESS,
  GROUP_MEMBERSHIPS_EXPAND_REQUEST,
  GROUP_MEMBERSHIPS_EXPAND_FAIL,
  GROUP_MEMBERSHIPS_EXPAND_SUCCESS,
  GROUP_PROMOTE_SUCCESS,
  GROUP_DEMOTE_SUCCESS,
  GROUP_KICK_SUCCESS,
  GROUP_BLOCK_SUCCESS,
} from '@/actions/groups.ts';

import type { APIEntity } from '@/types/entities.ts';
import type { AnyAction } from 'redux';

export type GroupRole = 'admin' | 'moderator' | 'user';

export interface List {
  next: string | null;
  isLoading: boolean;
  items: string[];
}

type State = Record<GroupRole, Record<string, List>>;

const initialState: State = {
  admin: {},
  moderator: {},
  user: {},
};

const roles: GroupRole[] = ['admin', 'moderator', 'user'];

const emptyList = (): List => ({
  next: null,
  isLoading: false,
  items: [],
});

const getList = (draft: Draft<State>, role: GroupRole, groupId: string): Draft<List> => {
  draft[role][groupId] ??= emptyList();
  return draft[role][groupId];
};

const updateLists = (draft: Draft<State>, groupId: string, memberships: APIEntity[]) => {
  memberships.forEach(membership => {
    roles.forEach(role => {
      const list = getList(draft, role, groupId);
      const accountId = membership.account.id;

      if (role === membership.role) {
        if (!list.items.includes(accountId)) list.items.push(accountId);
      } else {
        list.items = list.items.filter(id => id !== accountId);
      }
    });
  });
};

const removeFromLists = (draft: Draft<State>, groupId: string, accountId: string) => {
  roles.forEach(role => {
    const list = draft[role][groupId];
    if (list) {
      list.items = list.items.filter(id => id !== accountId);
    }
  });
};

export default function groupMemberships(state: State = initialState, action: AnyAction): State {
  switch (action.type) {
    case GROUP_DELETE_SUCCESS:
      return produce(state, draft => {
        roles.forEach(role => {
          delete draft[role][action.id];
        });
      });
    case GROUP_MEMBERSHIPS_FETCH_REQUEST:
    case GROUP_MEMBERSHIPS_EXPAND_REQUEST:
      return produce(state, draft => {
        getList(draft, action.role, action.id).isLoading = true;
      });
    case GROUP_MEMBERSHIPS_FETCH_FAIL:
    case GROUP_MEMBERSHIPS_EXPAND_FAIL:
      return produce(state, draft => {
        getList(draft, action.role, action.id).isLoading = false;
      });
    case GROUP_MEMBERSHIPS_FETCH_SUCCESS:
      return produce(state, draft => {
        draft[action.role as GroupRole][action.id] = {
          next: action.next,
          items: [...new Set<string>(action.memberships.map((item: APIEntity) => item.account.id))],
          isLoading: false,
        };
      });
    case GROUP_MEMBERSHIPS_EXPAND_SUCCESS:
      return produce(state, draft => {
        const list = getList(draft, action.role, action.id);
        list.next = action.next;
        list.isLoading = false;
        list.items = [...new Set([...list.items, ...action.memberships.map((item: APIEntity) => item.account.id)])];
      });
    case GROUP_PROMOTE_SUCCESS:
    case GROUP_DEMOTE_SUCCESS:
      return produce(state, draft => updateLists(draft, action.groupId, action.memberships));
    case GROUP_KICK_SUCCESS:
    case GROUP_BLOCK_SUCCESS:
      return produce(state, draft => removeFromLists(draft, action.groupId, action.accountId));
    default:
      return state;
  }
}
