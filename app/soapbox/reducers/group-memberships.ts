import { Map as ImmutableMap, OrderedSet as ImmutableOrderedSet, Record as ImmutableRecord } from 'immutable';

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
} from 'soapbox/actions/groups';

import type { AnyAction } from 'redux';
import type { APIEntity } from 'soapbox/types/entities';

const ListRecord = ImmutableRecord({
  next: null as string | null,
  isLoading: false,
  items: ImmutableOrderedSet<string>(),
});

const ReducerRecord = ImmutableRecord({
  admin: ImmutableMap<string, List>({}),
  moderator: ImmutableMap<string, List>({}),
  user: ImmutableMap<string, List>({}),
});

export type GroupRole = 'admin' | 'moderator' | 'user';
export type List = ReturnType<typeof ListRecord>;
type State = ReturnType<typeof ReducerRecord>;

const normalizeList = (state: State, path: string[], memberships: APIEntity[], next: string | null) => {
  return state.setIn(path, ListRecord({
    next,
    items: ImmutableOrderedSet(memberships.map(item => item.account.id)),
    isLoading: false,
  }));
};

const appendToList = (state: State, path: string[], memberships: APIEntity[], next: string | null) => {
  return state.updateIn(path, map => {
    return (map as List).set('next', next).set('isLoading', false).update('items', list => list.concat(memberships.map(item => item.account.id)));
  });
};

const updateLists = (state: State, groupId: string, memberships: APIEntity[]) => {
  const updateList = (state: State, role: string, membership: APIEntity) => {
    if (role === membership.role) {
      return state.updateIn([role, groupId], map => (map as List).update('items', set => set.add(membership.account.id)));
    } else {
      return state.updateIn([role, groupId], map => (map as List).update('items', set => set.delete(membership.account.id)));
    }
  };

  memberships.forEach(membership => {
    state = updateList(state, 'admin', membership);
    state = updateList(state, 'moderator', membership);
    state = updateList(state, 'user', membership);
  });

  return state;
};

const removeFromList = (state: State, path: string[], accountId: string) => {
  return state.updateIn(path, map => {
    return (map as List).update('items', set => set.delete(accountId));
  });
};

export default function groupMemberships(state: State = ReducerRecord(), action: AnyAction) {
  switch (action.type) {
    case GROUP_DELETE_SUCCESS:
      return state.deleteIn(['admin', action.id]).deleteIn(['moderator', action.id]).deleteIn(['user', action.id]);
    case GROUP_MEMBERSHIPS_FETCH_REQUEST:
    case GROUP_MEMBERSHIPS_EXPAND_REQUEST:
      return state.updateIn([action.role, action.id], map => (map as List || ListRecord()).set('isLoading', true));
    case GROUP_MEMBERSHIPS_FETCH_FAIL:
    case GROUP_MEMBERSHIPS_EXPAND_FAIL:
      return state.updateIn([action.role, action.id], map => (map as List || ListRecord()).set('isLoading', false));
    case GROUP_MEMBERSHIPS_FETCH_SUCCESS:
      return normalizeList(state, [action.role, action.id], action.memberships, action.next);
    case GROUP_MEMBERSHIPS_EXPAND_SUCCESS:
      return appendToList(state, [action.role, action.id], action.memberships, action.next);
    case GROUP_PROMOTE_SUCCESS:
    case GROUP_DEMOTE_SUCCESS:
      return updateLists(state, action.groupId, action.memberships);
    case GROUP_KICK_SUCCESS:
    case GROUP_BLOCK_SUCCESS:
      state = removeFromList(state, ['admin', action.groupId], action.accountId);
      state = removeFromList(state, ['moderator', action.groupId], action.accountId);
      state = removeFromList(state, ['user', action.groupId], action.accountId);
      return state;
    default:
      return state;
  }
}
