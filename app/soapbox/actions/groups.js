import api, { getLinks, getNext } from '../api';
import { importFetchedAccounts } from './importer';
import { fetchRelationships } from './accounts';
import { isLoggedIn } from 'soapbox/utils/auth';

export const GROUP_FETCH_REQUEST = 'GROUP_FETCH_REQUEST';
export const GROUP_FETCH_SUCCESS = 'GROUP_FETCH_SUCCESS';
export const GROUP_FETCH_FAIL    = 'GROUP_FETCH_FAIL';

export const GROUP_CREATE_REQUEST = 'GROUP_CREATE_REQUEST';
export const GROUP_CREATE_SUCCESS = 'GROUP_CREATE_SUCCESS';
export const GROUP_CREATE_FAIL    = 'GROUP_CREATE_FAIL';

export const GROUP_RELATIONSHIPS_FETCH_REQUEST = 'GROUP_RELATIONSHIPS_FETCH_REQUEST';
export const GROUP_RELATIONSHIPS_FETCH_SUCCESS = 'GROUP_RELATIONSHIPS_FETCH_SUCCESS';
export const GROUP_RELATIONSHIPS_FETCH_FAIL    = 'GROUP_RELATIONSHIPS_FETCH_FAIL';

export const GROUPS_FETCH_REQUEST = 'GROUPS_FETCH_REQUEST';
export const GROUPS_FETCH_SUCCESS = 'GROUPS_FETCH_SUCCESS';
export const GROUPS_FETCH_FAIL    = 'GROUPS_FETCH_FAIL';

export const GROUP_JOIN_REQUEST = 'GROUP_JOIN_REQUEST';
export const GROUP_JOIN_SUCCESS = 'GROUP_JOIN_SUCCESS';
export const GROUP_JOIN_FAIL    = 'GROUP_JOIN_FAIL';

export const GROUP_LEAVE_REQUEST = 'GROUP_LEAVE_REQUEST';
export const GROUP_LEAVE_SUCCESS = 'GROUP_LEAVE_SUCCESS';
export const GROUP_LEAVE_FAIL    = 'GROUP_LEAVE_FAIL';

export const GROUP_MEMBERS_FETCH_REQUEST = 'GROUP_MEMBERS_FETCH_REQUEST';
export const GROUP_MEMBERS_FETCH_SUCCESS = 'GROUP_MEMBERS_FETCH_SUCCESS';
export const GROUP_MEMBERS_FETCH_FAIL    = 'GROUP_MEMBERS_FETCH_FAIL';

export const GROUP_MEMBERS_EXPAND_REQUEST = 'GROUP_MEMBERS_EXPAND_REQUEST';
export const GROUP_MEMBERS_EXPAND_SUCCESS = 'GROUP_MEMBERS_EXPAND_SUCCESS';
export const GROUP_MEMBERS_EXPAND_FAIL    = 'GROUP_MEMBERS_EXPAND_FAIL';

export const GROUP_REMOVED_ACCOUNTS_FETCH_REQUEST = 'GROUP_REMOVED_ACCOUNTS_FETCH_REQUEST';
export const GROUP_REMOVED_ACCOUNTS_FETCH_SUCCESS = 'GROUP_REMOVED_ACCOUNTS_FETCH_SUCCESS';
export const GROUP_REMOVED_ACCOUNTS_FETCH_FAIL    = 'GROUP_REMOVED_ACCOUNTS_FETCH_FAIL';

export const GROUP_REMOVED_ACCOUNTS_EXPAND_REQUEST = 'GROUP_REMOVED_ACCOUNTS_EXPAND_REQUEST';
export const GROUP_REMOVED_ACCOUNTS_EXPAND_SUCCESS = 'GROUP_REMOVED_ACCOUNTS_EXPAND_SUCCESS';
export const GROUP_REMOVED_ACCOUNTS_EXPAND_FAIL    = 'GROUP_REMOVED_ACCOUNTS_EXPAND_FAIL';

export const GROUP_REMOVED_ACCOUNTS_REMOVE_REQUEST = 'GROUP_REMOVED_ACCOUNTS_REMOVE_REQUEST';
export const GROUP_REMOVED_ACCOUNTS_REMOVE_SUCCESS = 'GROUP_REMOVED_ACCOUNTS_REMOVE_SUCCESS';
export const GROUP_REMOVED_ACCOUNTS_REMOVE_FAIL    = 'GROUP_REMOVED_ACCOUNTS_REMOVE_FAIL';

export const GROUP_REMOVED_ACCOUNTS_CREATE_REQUEST = 'GROUP_REMOVED_ACCOUNTS_CREATE_REQUEST';
export const GROUP_REMOVED_ACCOUNTS_CREATE_SUCCESS = 'GROUP_REMOVED_ACCOUNTS_CREATE_SUCCESS';
export const GROUP_REMOVED_ACCOUNTS_CREATE_FAIL    = 'GROUP_REMOVED_ACCOUNTS_CREATE_FAIL';

export const GROUP_POST_STATUS_REQUEST = 'GROUP_POST_STATUS_REQUEST';
export const GROUP_POST_STATUS_SUCCESS = 'GROUP_POST_STATUS_SUCCESS';
export const GROUP_POST_STATUS_FAIL    = 'GROUP_POST_STATUS_FAIL';

export const GROUP_REMOVE_STATUS_REQUEST = 'GROUP_REMOVE_STATUS_REQUEST';
export const GROUP_REMOVE_STATUS_SUCCESS = 'GROUP_REMOVE_STATUS_SUCCESS';
export const GROUP_REMOVE_STATUS_FAIL    = 'GROUP_REMOVE_STATUS_FAIL';

export function fetchGroup(id) {
  return (dispatch, getState) => {
    dispatch({ type: GROUP_FETCH_REQUEST, id });
    api(getState).get(`/api/v1/pleroma/groups/${id}`).then(({ data: group }) => {
      dispatch({ type: GROUP_FETCH_SUCCESS, id, group });
      dispatch(fetchGroupRelationships([group.id]));
    }).catch(error => {
      dispatch({ type: GROUP_FETCH_FAIL, id, error });
    });
  };
}

export function createGroup(params) {
  return (dispatch, getState) => {
    dispatch({ type: GROUP_CREATE_REQUEST, params });
    return api(getState).post('/api/v1/pleroma/groups', params).then(({ data: group }) => {
      dispatch({ type: GROUP_CREATE_SUCCESS, group, params });
      return group;
    }).catch(error => {
      dispatch({ type: GROUP_CREATE_FAIL, error, params });
      return error;
    });
  };
}

export function fetchGroupRelationships(groupIds) {
  return (dispatch, getState) => {
    if (!isLoggedIn(getState)) return;

    const loadedRelationships = getState().get('group_relationships');
    const ids = groupIds.filter(id => loadedRelationships.get(id, null) === null);

    if (ids.length === 0) {
      return;
    }

    const query = ids.map(id => `id[]=${id}`).join('&');

    dispatch({ type: GROUP_RELATIONSHIPS_FETCH_REQUEST, ids, skipLoading: true });
    api(getState).get(`/api/v1/pleroma/groups/relationships?${query}`).then(({ data: relationships }) => {
      dispatch({ type: GROUP_RELATIONSHIPS_FETCH_SUCCESS, ids, relationships, skipLoading: true });
    }).catch(error => {
      dispatch({ type: GROUP_RELATIONSHIPS_FETCH_FAIL, ids, error, skipLoading: true });
    });
  };
}

export const fetchGroups = (tab) => (dispatch, getState) => {
  if (!isLoggedIn(getState)) return;

  dispatch(fetchGroupsRequest());

  api(getState).get('/api/v1/groups?tab=' + tab)
    .then(({ data }) => {
      dispatch(fetchGroupsSuccess(data, tab));
      dispatch(fetchGroupRelationships(data.map(item => item.id)));
    })
    .catch(err => dispatch(fetchGroupsFail(err)));
};

export const fetchGroupsRequest = () => ({
  type: GROUPS_FETCH_REQUEST,
});

export const fetchGroupsSuccess = (groups, tab) => ({
  type: GROUPS_FETCH_SUCCESS,
  groups,
  tab,
});

export const fetchGroupsFail = error => ({
  type: GROUPS_FETCH_FAIL,
  error,
});

export function joinGroup(id) {
  return (dispatch, getState) => {
    if (!isLoggedIn(getState)) return;

    dispatch({ type: GROUP_JOIN_REQUEST, id });
    api(getState).post(`/api/v1/pleroma/groups/${id}/join`).then(({ data: relationship }) => {
      dispatch({ type: GROUP_JOIN_SUCCESS, id, relationship });
    }).catch(error => {
      dispatch({ type: GROUP_JOIN_FAIL, id, error });
    });
  };
}

export function leaveGroup(id) {
  return (dispatch, getState) => {
    if (!isLoggedIn(getState)) return;

    dispatch({ type: GROUP_LEAVE_REQUEST, id });
    api(getState).post(`/api/v1/pleroma/groups/${id}/leave`).then(({ data: relationship }) => {
      dispatch({ type: GROUP_LEAVE_SUCCESS, id, relationship });
    }).catch(error => {
      dispatch({ type: GROUP_LEAVE_FAIL, id, error });
    });
  };
}

export function fetchMembers(id) {
  return (dispatch, getState) => {
    if (!isLoggedIn(getState)) return;

    dispatch({ type: GROUP_MEMBERS_FETCH_REQUEST, id });

    api(getState).get(`/api/v1/pleroma/groups/${id}/members`).then(response => {
      const accounts = response.data;
      const next = getNext(response);

      dispatch(importFetchedAccounts(accounts));
      dispatch({ type: GROUP_MEMBERS_FETCH_SUCCESS, id, accounts, next });
      dispatch(fetchRelationships(accounts.map(item => item.id)));
    }).catch(error => {
      dispatch({ type: GROUP_MEMBERS_FETCH_FAIL, id, error });
    });
  };
}

export function expandMembers(id) {
  return (dispatch, getState) => {
    if (!isLoggedIn(getState)) return;

    const url = getState().getIn(['user_lists', 'groups', id, 'next']);
    if (!url) return;

    dispatch({ type: GROUP_MEMBERS_EXPAND_REQUEST, id });

    api(getState).get(url).then(response => {
      const accounts = response.data;
      const next = getNext(response);

      dispatch(importFetchedAccounts(accounts));
      dispatch({ type: GROUP_MEMBERS_EXPAND_SUCCESS, id, accounts, next });
      dispatch(fetchRelationships(accounts.map(item => item.id)));
    }).catch(error => {
      dispatch({ type: GROUP_MEMBERS_EXPAND_FAIL, id, error });
    });
  };
}

export function fetchRemovedAccounts(id) {
  return (dispatch, getState) => {
    if (!isLoggedIn(getState)) return;

    dispatch(fetchRemovedAccountsRequest(id));

    api(getState).get(`/api/v1/groups/${id}/removed_accounts`).then(response => {
      const next = getLinks(response).refs.find(link => link.rel === 'next');

      dispatch(importFetchedAccounts(response.data));
      dispatch(fetchRemovedAccountsSuccess(id, response.data, next ? next.uri : null));
      dispatch(fetchRelationships(response.data.map(item => item.id)));
    }).catch(error => {
      dispatch(fetchRemovedAccountsFail(id, error));
    });
  };
}

export function fetchRemovedAccountsRequest(id) {
  return {
    type: GROUP_REMOVED_ACCOUNTS_FETCH_REQUEST,
    id,
  };
}

export function fetchRemovedAccountsSuccess(id, accounts, next) {
  return {
    type: GROUP_REMOVED_ACCOUNTS_FETCH_SUCCESS,
    id,
    accounts,
    next,
  };
}

export function fetchRemovedAccountsFail(id, error) {
  return {
    type: GROUP_REMOVED_ACCOUNTS_FETCH_FAIL,
    id,
    error,
  };
}

export function expandRemovedAccounts(id) {
  return (dispatch, getState) => {
    if (!isLoggedIn(getState)) return;

    const url = getState().getIn(['user_lists', 'groups_removed_accounts', id, 'next']);

    if (url === null) {
      return;
    }

    dispatch(expandRemovedAccountsRequest(id));

    api(getState).get(url).then(response => {
      const next = getLinks(response).refs.find(link => link.rel === 'next');

      dispatch(importFetchedAccounts(response.data));
      dispatch(expandRemovedAccountsSuccess(id, response.data, next ? next.uri : null));
      dispatch(fetchRelationships(response.data.map(item => item.id)));
    }).catch(error => {
      dispatch(expandRemovedAccountsFail(id, error));
    });
  };
}

export function expandRemovedAccountsRequest(id) {
  return {
    type: GROUP_REMOVED_ACCOUNTS_EXPAND_REQUEST,
    id,
  };
}

export function expandRemovedAccountsSuccess(id, accounts, next) {
  return {
    type: GROUP_REMOVED_ACCOUNTS_EXPAND_SUCCESS,
    id,
    accounts,
    next,
  };
}

export function expandRemovedAccountsFail(id, error) {
  return {
    type: GROUP_REMOVED_ACCOUNTS_EXPAND_FAIL,
    id,
    error,
  };
}

export function removeRemovedAccount(groupId, id) {
  return (dispatch, getState) => {
    if (!isLoggedIn(getState)) return;

    dispatch(removeRemovedAccountRequest(groupId, id));

    api(getState).delete(`/api/v1/groups/${groupId}/removed_accounts?account_id=${id}`).then(response => {
      dispatch(removeRemovedAccountSuccess(groupId, id));
    }).catch(error => {
      dispatch(removeRemovedAccountFail(groupId, id, error));
    });
  };
}

export function removeRemovedAccountRequest(groupId, id) {
  return {
    type: GROUP_REMOVED_ACCOUNTS_REMOVE_REQUEST,
    groupId,
    id,
  };
}

export function removeRemovedAccountSuccess(groupId, id) {
  return {
    type: GROUP_REMOVED_ACCOUNTS_REMOVE_SUCCESS,
    groupId,
    id,
  };
}

export function removeRemovedAccountFail(groupId, id, error) {
  return {
    type: GROUP_REMOVED_ACCOUNTS_REMOVE_FAIL,
    groupId,
    id,
    error,
  };
}

export function createRemovedAccount(groupId, id) {
  return (dispatch, getState) => {
    if (!isLoggedIn(getState)) return;

    dispatch(createRemovedAccountRequest(groupId, id));

    api(getState).post(`/api/v1/groups/${groupId}/removed_accounts?account_id=${id}`).then(response => {
      dispatch(createRemovedAccountSuccess(groupId, id));
    }).catch(error => {
      dispatch(createRemovedAccountFail(groupId, id, error));
    });
  };
}

export function createRemovedAccountRequest(groupId, id) {
  return {
    type: GROUP_REMOVED_ACCOUNTS_CREATE_REQUEST,
    groupId,
    id,
  };
}

export function createRemovedAccountSuccess(groupId, id) {
  return {
    type: GROUP_REMOVED_ACCOUNTS_CREATE_SUCCESS,
    groupId,
    id,
  };
}

export function createRemovedAccountFail(groupId, id, error) {
  return {
    type: GROUP_REMOVED_ACCOUNTS_CREATE_FAIL,
    groupId,
    id,
    error,
  };
}

export function groupPostStatus(groupId, params, idempotencyKey) {
  return (dispatch, getState) => {
    dispatch({ type: GROUP_POST_STATUS_REQUEST, groupId, params, idempotencyKey });

    return api(getState).post(`/api/v1/pleroma/groups/${groupId}/statuses`, params, {
      headers: { 'Idempotency-Key': idempotencyKey },
    }).then(({ data: status }) => {
      dispatch({ type: GROUP_POST_STATUS_SUCCESS, groupId, params, status, idempotencyKey });
      return status;
    }).catch(error => {
      dispatch({ type: GROUP_POST_STATUS_FAIL, groupId, params, error, idempotencyKey });
      throw error;
    });
  };
}

export function groupRemoveStatus(groupId, id) {
  return (dispatch, getState) => {
    if (!isLoggedIn(getState)) return;

    dispatch(groupRemoveStatusRequest(groupId, id));

    api(getState).delete(`/api/v1/groups/${groupId}/statuses/${id}`).then(response => {
      dispatch(groupRemoveStatusSuccess(groupId, id));
    }).catch(error => {
      dispatch(groupRemoveStatusFail(groupId, id, error));
    });
  };
}

export function groupRemoveStatusRequest(groupId, id) {
  return {
    type: GROUP_REMOVE_STATUS_REQUEST,
    groupId,
    id,
  };
}

export function groupRemoveStatusSuccess(groupId, id) {
  return {
    type: GROUP_REMOVE_STATUS_SUCCESS,
    groupId,
    id,
  };
}

export function groupRemoveStatusFail(groupId, id, error) {
  return {
    type: GROUP_REMOVE_STATUS_FAIL,
    groupId,
    id,
    error,
  };
}
