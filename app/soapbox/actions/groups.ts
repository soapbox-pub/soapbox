import { defineMessages } from 'react-intl';

import toast from 'soapbox/toast';

import api, { getLinks } from '../api';

import { fetchRelationships } from './accounts';
import { importFetchedGroups, importFetchedAccounts } from './importer';
import { closeModal, openModal } from './modals';
import { deleteFromTimelines } from './timelines';

import type { AxiosError } from 'axios';
import type { GroupRole } from 'soapbox/reducers/group-memberships';
import type { AppDispatch, RootState } from 'soapbox/store';
import type { APIEntity, Group } from 'soapbox/types/entities';

const GROUP_EDITOR_SET = 'GROUP_EDITOR_SET';

const GROUP_CREATE_REQUEST = 'GROUP_CREATE_REQUEST';
const GROUP_CREATE_SUCCESS = 'GROUP_CREATE_SUCCESS';
const GROUP_CREATE_FAIL    = 'GROUP_CREATE_FAIL';

const GROUP_UPDATE_REQUEST = 'GROUP_UPDATE_REQUEST';
const GROUP_UPDATE_SUCCESS = 'GROUP_UPDATE_SUCCESS';
const GROUP_UPDATE_FAIL    = 'GROUP_UPDATE_FAIL';

const GROUP_DELETE_REQUEST = 'GROUP_DELETE_REQUEST';
const GROUP_DELETE_SUCCESS = 'GROUP_DELETE_SUCCESS';
const GROUP_DELETE_FAIL    = 'GROUP_DELETE_FAIL';

const GROUP_FETCH_REQUEST = 'GROUP_FETCH_REQUEST';
const GROUP_FETCH_SUCCESS = 'GROUP_FETCH_SUCCESS';
const GROUP_FETCH_FAIL    = 'GROUP_FETCH_FAIL';

const GROUPS_FETCH_REQUEST = 'GROUPS_FETCH_REQUEST';
const GROUPS_FETCH_SUCCESS = 'GROUPS_FETCH_SUCCESS';
const GROUPS_FETCH_FAIL    = 'GROUPS_FETCH_FAIL';

const GROUP_RELATIONSHIPS_FETCH_REQUEST = 'GROUP_RELATIONSHIPS_FETCH_REQUEST';
const GROUP_RELATIONSHIPS_FETCH_SUCCESS = 'GROUP_RELATIONSHIPS_FETCH_SUCCESS';
const GROUP_RELATIONSHIPS_FETCH_FAIL    = 'GROUP_RELATIONSHIPS_FETCH_FAIL';

const GROUP_JOIN_REQUEST = 'GROUP_JOIN_REQUEST';
const GROUP_JOIN_SUCCESS = 'GROUP_JOIN_SUCCESS';
const GROUP_JOIN_FAIL    = 'GROUP_JOIN_FAIL';

const GROUP_LEAVE_REQUEST = 'GROUP_LEAVE_REQUEST';
const GROUP_LEAVE_SUCCESS = 'GROUP_LEAVE_SUCCESS';
const GROUP_LEAVE_FAIL    = 'GROUP_LEAVE_FAIL';

const GROUP_DELETE_STATUS_REQUEST = 'GROUP_DELETE_STATUS_REQUEST';
const GROUP_DELETE_STATUS_SUCCESS = 'GROUP_DELETE_STATUS_SUCCESS';
const GROUP_DELETE_STATUS_FAIL    = 'GROUP_DELETE_STATUS_FAIL';

const GROUP_KICK_REQUEST = 'GROUP_KICK_REQUEST';
const GROUP_KICK_SUCCESS = 'GROUP_KICK_SUCCESS';
const GROUP_KICK_FAIL    = 'GROUP_KICK_FAIL';

const GROUP_BLOCKS_FETCH_REQUEST = 'GROUP_BLOCKS_FETCH_REQUEST';
const GROUP_BLOCKS_FETCH_SUCCESS = 'GROUP_BLOCKS_FETCH_SUCCESS';
const GROUP_BLOCKS_FETCH_FAIL    = 'GROUP_BLOCKS_FETCH_FAIL';

const GROUP_BLOCKS_EXPAND_REQUEST = 'GROUP_BLOCKS_EXPAND_REQUEST';
const GROUP_BLOCKS_EXPAND_SUCCESS = 'GROUP_BLOCKS_EXPAND_SUCCESS';
const GROUP_BLOCKS_EXPAND_FAIL    = 'GROUP_BLOCKS_EXPAND_FAIL';

const GROUP_BLOCK_REQUEST = 'GROUP_BLOCK_REQUEST';
const GROUP_BLOCK_SUCCESS = 'GROUP_BLOCK_SUCCESS';
const GROUP_BLOCK_FAIL    = 'GROUP_BLOCK_FAIL';

const GROUP_UNBLOCK_REQUEST = 'GROUP_UNBLOCK_REQUEST';
const GROUP_UNBLOCK_SUCCESS = 'GROUP_UNBLOCK_SUCCESS';
const GROUP_UNBLOCK_FAIL    = 'GROUP_UNBLOCK_FAIL';

const GROUP_PROMOTE_REQUEST = 'GROUP_PROMOTE_REQUEST';
const GROUP_PROMOTE_SUCCESS = 'GROUP_PROMOTE_SUCCESS';
const GROUP_PROMOTE_FAIL    = 'GROUP_PROMOTE_FAIL';

const GROUP_DEMOTE_REQUEST = 'GROUP_DEMOTE_REQUEST';
const GROUP_DEMOTE_SUCCESS = 'GROUP_DEMOTE_SUCCESS';
const GROUP_DEMOTE_FAIL    = 'GROUP_DEMOTE_FAIL';

const GROUP_MEMBERSHIPS_FETCH_REQUEST = 'GROUP_MEMBERSHIPS_FETCH_REQUEST';
const GROUP_MEMBERSHIPS_FETCH_SUCCESS = 'GROUP_MEMBERSHIPS_FETCH_SUCCESS';
const GROUP_MEMBERSHIPS_FETCH_FAIL    = 'GROUP_MEMBERSHIPS_FETCH_FAIL';

const GROUP_MEMBERSHIPS_EXPAND_REQUEST = 'GROUP_MEMBERSHIPS_EXPAND_REQUEST';
const GROUP_MEMBERSHIPS_EXPAND_SUCCESS = 'GROUP_MEMBERSHIPS_EXPAND_SUCCESS';
const GROUP_MEMBERSHIPS_EXPAND_FAIL    = 'GROUP_MEMBERSHIPS_EXPAND_FAIL';

const GROUP_MEMBERSHIP_REQUESTS_FETCH_REQUEST = 'GROUP_MEMBERSHIP_REQUESTS_FETCH_REQUEST';
const GROUP_MEMBERSHIP_REQUESTS_FETCH_SUCCESS = 'GROUP_MEMBERSHIP_REQUESTS_FETCH_SUCCESS';
const GROUP_MEMBERSHIP_REQUESTS_FETCH_FAIL    = 'GROUP_MEMBERSHIP_REQUESTS_FETCH_FAIL';

const GROUP_MEMBERSHIP_REQUESTS_EXPAND_REQUEST = 'GROUP_MEMBERSHIP_REQUESTS_EXPAND_REQUEST';
const GROUP_MEMBERSHIP_REQUESTS_EXPAND_SUCCESS = 'GROUP_MEMBERSHIP_REQUESTS_EXPAND_SUCCESS';
const GROUP_MEMBERSHIP_REQUESTS_EXPAND_FAIL    = 'GROUP_MEMBERSHIP_REQUESTS_EXPAND_FAIL';

const GROUP_MEMBERSHIP_REQUEST_AUTHORIZE_REQUEST = 'GROUP_MEMBERSHIP_REQUEST_AUTHORIZE_REQUEST';
const GROUP_MEMBERSHIP_REQUEST_AUTHORIZE_SUCCESS = 'GROUP_MEMBERSHIP_REQUEST_AUTHORIZE_SUCCESS';
const GROUP_MEMBERSHIP_REQUEST_AUTHORIZE_FAIL    = 'GROUP_MEMBERSHIP_REQUEST_AUTHORIZE_FAIL';

const GROUP_MEMBERSHIP_REQUEST_REJECT_REQUEST = 'GROUP_MEMBERSHIP_REQUEST_REJECT_REQUEST';
const GROUP_MEMBERSHIP_REQUEST_REJECT_SUCCESS = 'GROUP_MEMBERSHIP_REQUEST_REJECT_SUCCESS';
const GROUP_MEMBERSHIP_REQUEST_REJECT_FAIL    = 'GROUP_MEMBERSHIP_REQUEST_REJECT_FAIL';

const GROUP_EDITOR_TITLE_CHANGE       = 'GROUP_EDITOR_TITLE_CHANGE';
const GROUP_EDITOR_DESCRIPTION_CHANGE = 'GROUP_EDITOR_DESCRIPTION_CHANGE';
const GROUP_EDITOR_PRIVACY_CHANGE     = 'GROUP_EDITOR_PRIVACY_CHANGE';
const GROUP_EDITOR_MEDIA_CHANGE       = 'GROUP_EDITOR_MEDIA_CHANGE';

const GROUP_EDITOR_RESET = 'GROUP_EDITOR_RESET';

const messages = defineMessages({
  success: { id: 'manage_group.submit_success', defaultMessage: 'The group was created' },
  editSuccess: { id: 'manage_group.edit_success', defaultMessage: 'The group was edited' },
  joinSuccess: { id: 'group.join.success', defaultMessage: 'Joined the group' },
  joinRequestSuccess: { id: 'group.join.request_success', defaultMessage: 'Requested to join the group' },
  leaveSuccess: { id: 'group.leave.success', defaultMessage: 'Left the group' },
  view: { id: 'toast.view', defaultMessage: 'View' },
});

const editGroup = (group: Group) => (dispatch: AppDispatch) => {
  dispatch({
    type: GROUP_EDITOR_SET,
    group,
  });
  dispatch(openModal('MANAGE_GROUP'));
};

const createGroup = (params: Record<string, any>, shouldReset?: boolean) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(createGroupRequest());

    return api(getState).post('/api/v1/groups', params, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
      .then(({ data }) => {
        dispatch(importFetchedGroups([data]));
        dispatch(createGroupSuccess(data));
        toast.success(messages.success, {
          actionLabel: messages.view,
          actionLink: `/groups/${data.id}`,
        });

        if (shouldReset) {
          dispatch(resetGroupEditor());
        }
        dispatch(closeModal('MANAGE_GROUP'));
      }).catch(err => dispatch(createGroupFail(err)));
  };

const createGroupRequest = () => ({
  type: GROUP_CREATE_REQUEST,
});

const createGroupSuccess = (group: APIEntity) => ({
  type: GROUP_CREATE_SUCCESS,
  group,
});

const createGroupFail = (error: AxiosError) => ({
  type: GROUP_CREATE_FAIL,
  error,
});

const updateGroup = (id: string, params: Record<string, any>, shouldReset?: boolean) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(updateGroupRequest());

    return api(getState).put(`/api/v1/groups/${id}`, params)
      .then(({ data }) => {
        dispatch(importFetchedGroups([data]));
        dispatch(updateGroupSuccess(data));
        toast.success(messages.editSuccess);

        if (shouldReset) {
          dispatch(resetGroupEditor());
        }
        dispatch(closeModal('MANAGE_GROUP'));
      }).catch(err => dispatch(updateGroupFail(err)));
  };

const updateGroupRequest = () => ({
  type: GROUP_UPDATE_REQUEST,
});

const updateGroupSuccess = (group: APIEntity) => ({
  type: GROUP_UPDATE_SUCCESS,
  group,
});

const updateGroupFail = (error: AxiosError) => ({
  type: GROUP_UPDATE_FAIL,
  error,
});

const deleteGroup = (id: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(deleteGroupRequest(id));

  return api(getState).delete(`/api/v1/groups/${id}`)
    .then(() => dispatch(deleteGroupSuccess(id)))
    .catch(err => dispatch(deleteGroupFail(id, err)));
};

const deleteGroupRequest = (id: string) => ({
  type: GROUP_DELETE_REQUEST,
  id,
});

const deleteGroupSuccess = (id: string) => ({
  type: GROUP_DELETE_SUCCESS,
  id,
});

const deleteGroupFail = (id: string, error: AxiosError) => ({
  type: GROUP_DELETE_FAIL,
  id,
  error,
});

const fetchGroup = (id: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(fetchGroupRelationships([id]));
  dispatch(fetchGroupRequest(id));

  return api(getState).get(`/api/v1/groups/${id}`)
    .then(({ data }) => {
      dispatch(importFetchedGroups([data]));
      dispatch(fetchGroupSuccess(data));
    })
    .catch(err => dispatch(fetchGroupFail(id, err)));
};

const fetchGroupRequest = (id: string) => ({
  type: GROUP_FETCH_REQUEST,
  id,
});

const fetchGroupSuccess = (group: APIEntity) => ({
  type: GROUP_FETCH_SUCCESS,
  group,
});

const fetchGroupFail = (id: string, error: AxiosError) => ({
  type: GROUP_FETCH_FAIL,
  id,
  error,
});

const fetchGroups = () => (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(fetchGroupsRequest());

  return api(getState).get('/api/v1/groups')
    .then(({ data }) => {
      dispatch(importFetchedGroups(data));
      dispatch(fetchGroupsSuccess(data));
      dispatch(fetchGroupRelationships(data.map((item: APIEntity) => item.id)));
    }).catch(err => dispatch(fetchGroupsFail(err)));
};

const fetchGroupsRequest = () => ({
  type: GROUPS_FETCH_REQUEST,
});

const fetchGroupsSuccess = (groups: APIEntity[]) => ({
  type: GROUPS_FETCH_SUCCESS,
  groups,
});

const fetchGroupsFail = (error: AxiosError) => ({
  type: GROUPS_FETCH_FAIL,
  error,
});

const fetchGroupRelationships = (groupIds: string[]) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const loadedRelationships = state.group_relationships;
    const newGroupIds = groupIds.filter(id => loadedRelationships.get(id, null) === null);

    if (!state.me || newGroupIds.length === 0) {
      return;
    }

    dispatch(fetchGroupRelationshipsRequest(newGroupIds));

    return api(getState).get(`/api/v1/groups/relationships?${newGroupIds.map(id => `id[]=${id}`).join('&')}`).then(response => {
      dispatch(fetchGroupRelationshipsSuccess(response.data));
    }).catch(error => {
      dispatch(fetchGroupRelationshipsFail(error));
    });
  };

const fetchGroupRelationshipsRequest = (ids: string[]) => ({
  type: GROUP_RELATIONSHIPS_FETCH_REQUEST,
  ids,
  skipLoading: true,
});

const fetchGroupRelationshipsSuccess = (relationships: APIEntity[]) => ({
  type: GROUP_RELATIONSHIPS_FETCH_SUCCESS,
  relationships,
  skipLoading: true,
});

const fetchGroupRelationshipsFail = (error: AxiosError) => ({
  type: GROUP_RELATIONSHIPS_FETCH_FAIL,
  error,
  skipLoading: true,
  skipNotFound: true,
});

const joinGroup = (id: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const locked = (getState().groups.items.get(id) as any).locked || false;

    dispatch(joinGroupRequest(id, locked));

    return api(getState).post(`/api/v1/groups/${id}/join`).then(response => {
      dispatch(joinGroupSuccess(response.data));
      toast.success(locked ? messages.joinRequestSuccess : messages.joinSuccess);
    }).catch(error => {
      dispatch(joinGroupFail(error, locked));
    });
  };

const leaveGroup = (id: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(leaveGroupRequest(id));

    return api(getState).post(`/api/v1/groups/${id}/leave`).then(response => {
      dispatch(leaveGroupSuccess(response.data));
      toast.success(messages.leaveSuccess);
    }).catch(error => {
      dispatch(leaveGroupFail(error));
    });
  };

const joinGroupRequest = (id: string, locked: boolean) => ({
  type: GROUP_JOIN_REQUEST,
  id,
  locked,
  skipLoading: true,
});

const joinGroupSuccess = (relationship: APIEntity) => ({
  type: GROUP_JOIN_SUCCESS,
  relationship,
  skipLoading: true,
});

const joinGroupFail = (error: AxiosError, locked: boolean) => ({
  type: GROUP_JOIN_FAIL,
  error,
  locked,
  skipLoading: true,
});

const leaveGroupRequest = (id: string) => ({
  type: GROUP_LEAVE_REQUEST,
  id,
  skipLoading: true,
});

const leaveGroupSuccess = (relationship: APIEntity) => ({
  type: GROUP_LEAVE_SUCCESS,
  relationship,
  skipLoading: true,
});

const leaveGroupFail = (error: AxiosError) => ({
  type: GROUP_LEAVE_FAIL,
  error,
  skipLoading: true,
});

const groupDeleteStatus = (groupId: string, statusId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(groupDeleteStatusRequest(groupId, statusId));

    return api(getState).delete(`/api/v1/groups/${groupId}/statuses/${statusId}`)
      .then(() => {
        dispatch(deleteFromTimelines(statusId));
        dispatch(groupDeleteStatusSuccess(groupId, statusId));
      }).catch(err => dispatch(groupDeleteStatusFail(groupId, statusId, err)));
  };

const groupDeleteStatusRequest = (groupId: string, statusId: string) => ({
  type: GROUP_DELETE_STATUS_REQUEST,
  groupId,
  statusId,
});

const groupDeleteStatusSuccess = (groupId: string, statusId: string) => ({
  type: GROUP_DELETE_STATUS_SUCCESS,
  groupId,
  statusId,
});

const groupDeleteStatusFail = (groupId: string, statusId: string, error: AxiosError) => ({
  type: GROUP_DELETE_STATUS_SUCCESS,
  groupId,
  statusId,
  error,
});

const groupKick = (groupId: string, accountId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(groupKickRequest(groupId, accountId));

    return api(getState).post(`/api/v1/groups/${groupId}/kick`, { account_ids: [accountId] })
      .then(() => dispatch(groupKickSuccess(groupId, accountId)))
      .catch(err => dispatch(groupKickFail(groupId, accountId, err)));
  };

const groupKickRequest = (groupId: string, accountId: string) => ({
  type: GROUP_KICK_REQUEST,
  groupId,
  accountId,
});

const groupKickSuccess = (groupId: string, accountId: string) => ({
  type: GROUP_KICK_SUCCESS,
  groupId,
  accountId,
});

const groupKickFail = (groupId: string, accountId: string, error: AxiosError) => ({
  type: GROUP_KICK_SUCCESS,
  groupId,
  accountId,
  error,
});

const fetchGroupBlocks = (id: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(fetchGroupBlocksRequest(id));

    return api(getState).get(`/api/v1/groups/${id}/blocks`).then(response => {
      const next = getLinks(response).refs.find(link => link.rel === 'next');

      dispatch(importFetchedAccounts(response.data));
      dispatch(fetchGroupBlocksSuccess(id, response.data, next ? next.uri : null));
    }).catch(error => {
      dispatch(fetchGroupBlocksFail(id, error));
    });
  };

const fetchGroupBlocksRequest = (id: string) => ({
  type: GROUP_BLOCKS_FETCH_REQUEST,
  id,
});

const fetchGroupBlocksSuccess = (id: string, accounts: APIEntity[], next: string | null) => ({
  type: GROUP_BLOCKS_FETCH_SUCCESS,
  id,
  accounts,
  next,
});

const fetchGroupBlocksFail = (id: string, error: AxiosError) => ({
  type: GROUP_BLOCKS_FETCH_FAIL,
  id,
  error,
  skipNotFound: true,
});

const expandGroupBlocks = (id: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const url = getState().user_lists.group_blocks.get(id)?.next || null;

    if (url === null) {
      return;
    }

    dispatch(expandGroupBlocksRequest(id));

    return api(getState).get(url).then(response => {
      const next = getLinks(response).refs.find(link => link.rel === 'next');

      dispatch(importFetchedAccounts(response.data));
      dispatch(expandGroupBlocksSuccess(id, response.data, next ? next.uri : null));
      dispatch(fetchRelationships(response.data.map((item: APIEntity) => item.id)));
    }).catch(error => {
      dispatch(expandGroupBlocksFail(id, error));
    });
  };

const expandGroupBlocksRequest = (id: string) => ({
  type: GROUP_BLOCKS_EXPAND_REQUEST,
  id,
});

const expandGroupBlocksSuccess = (id: string, accounts: APIEntity[], next: string | null) => ({
  type: GROUP_BLOCKS_EXPAND_SUCCESS,
  id,
  accounts,
  next,
});

const expandGroupBlocksFail = (id: string, error: AxiosError) => ({
  type: GROUP_BLOCKS_EXPAND_FAIL,
  id,
  error,
});

const groupBlock = (groupId: string, accountId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(groupBlockRequest(groupId, accountId));

    return api(getState).post(`/api/v1/groups/${groupId}/blocks`, { account_ids: [accountId] })
      .then(() => dispatch(groupBlockSuccess(groupId, accountId)))
      .catch(err => dispatch(groupBlockFail(groupId, accountId, err)));
  };

const groupBlockRequest = (groupId: string, accountId: string) => ({
  type: GROUP_BLOCK_REQUEST,
  groupId,
  accountId,
});

const groupBlockSuccess = (groupId: string, accountId: string) => ({
  type: GROUP_BLOCK_SUCCESS,
  groupId,
  accountId,
});

const groupBlockFail = (groupId: string, accountId: string, error: AxiosError) => ({
  type: GROUP_BLOCK_FAIL,
  groupId,
  accountId,
  error,
});

const groupUnblock = (groupId: string, accountId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(groupUnblockRequest(groupId, accountId));

    return api(getState).delete(`/api/v1/groups/${groupId}/blocks?account_ids[]=${accountId}`)
      .then(() => dispatch(groupUnblockSuccess(groupId, accountId)))
      .catch(err => dispatch(groupUnblockFail(groupId, accountId, err)));
  };

const groupUnblockRequest = (groupId: string, accountId: string) => ({
  type: GROUP_UNBLOCK_REQUEST,
  groupId,
  accountId,
});

const groupUnblockSuccess = (groupId: string, accountId: string) => ({
  type: GROUP_UNBLOCK_SUCCESS,
  groupId,
  accountId,
});

const groupUnblockFail = (groupId: string, accountId: string, error: AxiosError) => ({
  type: GROUP_UNBLOCK_FAIL,
  groupId,
  accountId,
  error,
});

const groupPromoteAccount = (groupId: string, accountId: string, role: GroupRole) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(groupPromoteAccountRequest(groupId, accountId));

    return api(getState).post(`/api/v1/groups/${groupId}/promote`, { account_ids: [accountId], role: role })
      .then((response) => dispatch(groupPromoteAccountSuccess(groupId, accountId, response.data)))
      .catch(err => dispatch(groupPromoteAccountFail(groupId, accountId, err)));
  };

const groupPromoteAccountRequest = (groupId: string, accountId: string) => ({
  type: GROUP_PROMOTE_REQUEST,
  groupId,
  accountId,
});

const groupPromoteAccountSuccess = (groupId: string, accountId: string, memberships: APIEntity[]) => ({
  type: GROUP_PROMOTE_SUCCESS,
  groupId,
  accountId,
  memberships,
});

const groupPromoteAccountFail = (groupId: string, accountId: string, error: AxiosError) => ({
  type: GROUP_PROMOTE_FAIL,
  groupId,
  accountId,
  error,
});

const groupDemoteAccount = (groupId: string, accountId: string, role: GroupRole) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(groupDemoteAccountRequest(groupId, accountId));

    return api(getState).post(`/api/v1/groups/${groupId}/demote`, { account_ids: [accountId], role: role })
      .then((response) => dispatch(groupDemoteAccountSuccess(groupId, accountId, response.data)))
      .catch(err => dispatch(groupDemoteAccountFail(groupId, accountId, err)));
  };

const groupDemoteAccountRequest = (groupId: string, accountId: string) => ({
  type: GROUP_DEMOTE_REQUEST,
  groupId,
  accountId,
});

const groupDemoteAccountSuccess = (groupId: string, accountId: string, memberships: APIEntity[]) => ({
  type: GROUP_DEMOTE_SUCCESS,
  groupId,
  accountId,
  memberships,
});

const groupDemoteAccountFail = (groupId: string, accountId: string, error: AxiosError) => ({
  type: GROUP_DEMOTE_FAIL,
  groupId,
  accountId,
  error,
});

const fetchGroupMemberships = (id: string, role: GroupRole) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(fetchGroupMembershipsRequest(id, role));

    return api(getState).get(`/api/v1/groups/${id}/memberships`, { params: { role } }).then(response => {
      const next = getLinks(response).refs.find(link => link.rel === 'next');

      dispatch(importFetchedAccounts(response.data.map((membership: APIEntity) => membership.account)));
      dispatch(fetchGroupMembershipsSuccess(id, role, response.data, next ? next.uri : null));
    }).catch(error => {
      dispatch(fetchGroupMembershipsFail(id, role, error));
    });
  };

const fetchGroupMembershipsRequest = (id: string, role: GroupRole) => ({
  type: GROUP_MEMBERSHIPS_FETCH_REQUEST,
  id,
  role,
});

const fetchGroupMembershipsSuccess = (id: string, role: GroupRole, memberships: APIEntity[], next: string | null) => ({
  type: GROUP_MEMBERSHIPS_FETCH_SUCCESS,
  id,
  role,
  memberships,
  next,
});

const fetchGroupMembershipsFail = (id: string, role: GroupRole, error: AxiosError) => ({
  type: GROUP_MEMBERSHIPS_FETCH_FAIL,
  id,
  role,
  error,
  skipNotFound: true,
});

const expandGroupMemberships = (id: string, role: GroupRole) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const url = getState().group_memberships.get(role).get(id)?.next || null;

    if (url === null) {
      return;
    }

    dispatch(expandGroupMembershipsRequest(id, role));

    return api(getState).get(url).then(response => {
      const next = getLinks(response).refs.find(link => link.rel === 'next');

      dispatch(importFetchedAccounts(response.data.map((membership: APIEntity) => membership.account)));
      dispatch(expandGroupMembershipsSuccess(id, role, response.data, next ? next.uri : null));
      dispatch(fetchRelationships(response.data.map((item: APIEntity) => item.id)));
    }).catch(error => {
      dispatch(expandGroupMembershipsFail(id, role, error));
    });
  };

const expandGroupMembershipsRequest = (id: string, role: GroupRole) => ({
  type: GROUP_MEMBERSHIPS_EXPAND_REQUEST,
  id,
  role,
});

const expandGroupMembershipsSuccess = (id: string, role: GroupRole, memberships: APIEntity[], next: string | null) => ({
  type: GROUP_MEMBERSHIPS_EXPAND_SUCCESS,
  id,
  role,
  memberships,
  next,
});

const expandGroupMembershipsFail = (id: string, role: GroupRole, error: AxiosError) => ({
  type: GROUP_MEMBERSHIPS_EXPAND_FAIL,
  id,
  role,
  error,
});

const fetchGroupMembershipRequests = (id: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(fetchGroupMembershipRequestsRequest(id));

    return api(getState).get(`/api/v1/groups/${id}/membership_requests`).then(response => {
      const next = getLinks(response).refs.find(link => link.rel === 'next');

      dispatch(importFetchedAccounts(response.data));
      dispatch(fetchGroupMembershipRequestsSuccess(id, response.data, next ? next.uri : null));
    }).catch(error => {
      dispatch(fetchGroupMembershipRequestsFail(id, error));
    });
  };

const fetchGroupMembershipRequestsRequest = (id: string) => ({
  type: GROUP_MEMBERSHIP_REQUESTS_FETCH_REQUEST,
  id,
});

const fetchGroupMembershipRequestsSuccess = (id: string, accounts: APIEntity[], next: string | null) => ({
  type: GROUP_MEMBERSHIP_REQUESTS_FETCH_SUCCESS,
  id,
  accounts,
  next,
});

const fetchGroupMembershipRequestsFail = (id: string, error: AxiosError) => ({
  type: GROUP_MEMBERSHIP_REQUESTS_FETCH_FAIL,
  id,
  error,
  skipNotFound: true,
});

const expandGroupMembershipRequests = (id: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const url = getState().user_lists.membership_requests.get(id)?.next || null;

    if (url === null) {
      return;
    }

    dispatch(expandGroupMembershipRequestsRequest(id));

    return api(getState).get(url).then(response => {
      const next = getLinks(response).refs.find(link => link.rel === 'next');

      dispatch(importFetchedAccounts(response.data));
      dispatch(expandGroupMembershipRequestsSuccess(id, response.data, next ? next.uri : null));
      dispatch(fetchRelationships(response.data.map((item: APIEntity) => item.id)));
    }).catch(error => {
      dispatch(expandGroupMembershipRequestsFail(id, error));
    });
  };

const expandGroupMembershipRequestsRequest = (id: string) => ({
  type: GROUP_MEMBERSHIP_REQUESTS_EXPAND_REQUEST,
  id,
});

const expandGroupMembershipRequestsSuccess = (id: string, accounts: APIEntity[], next: string | null) => ({
  type: GROUP_MEMBERSHIP_REQUESTS_EXPAND_SUCCESS,
  id,
  accounts,
  next,
});

const expandGroupMembershipRequestsFail = (id: string, error: AxiosError) => ({
  type: GROUP_MEMBERSHIP_REQUESTS_EXPAND_FAIL,
  id,
  error,
});

const authorizeGroupMembershipRequest = (groupId: string, accountId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(authorizeGroupMembershipRequestRequest(groupId, accountId));

    return api(getState)
      .post(`/api/v1/groups/${groupId}/membership_requests/${accountId}/authorize`)
      .then(() => dispatch(authorizeGroupMembershipRequestSuccess(groupId, accountId)))
      .catch(error => dispatch(authorizeGroupMembershipRequestFail(groupId, accountId, error)));
  };

const authorizeGroupMembershipRequestRequest = (groupId: string, accountId: string) => ({
  type: GROUP_MEMBERSHIP_REQUEST_AUTHORIZE_REQUEST,
  groupId,
  accountId,
});

const authorizeGroupMembershipRequestSuccess = (groupId: string, accountId: string) => ({
  type: GROUP_MEMBERSHIP_REQUEST_AUTHORIZE_SUCCESS,
  groupId,
  accountId,
});

const authorizeGroupMembershipRequestFail = (groupId: string, accountId: string, error: AxiosError) => ({
  type: GROUP_MEMBERSHIP_REQUEST_AUTHORIZE_FAIL,
  groupId,
  accountId,
  error,
});

const rejectGroupMembershipRequest = (groupId: string, accountId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(rejectGroupMembershipRequestRequest(groupId, accountId));

    return api(getState)
      .post(`/api/v1/groups/${groupId}/membership_requests/${accountId}/reject`)
      .then(() => dispatch(rejectGroupMembershipRequestSuccess(groupId, accountId)))
      .catch(error => dispatch(rejectGroupMembershipRequestFail(groupId, accountId, error)));
  };

const rejectGroupMembershipRequestRequest = (groupId: string, accountId: string) => ({
  type: GROUP_MEMBERSHIP_REQUEST_REJECT_REQUEST,
  groupId,
  accountId,
});

const rejectGroupMembershipRequestSuccess = (groupId: string, accountId: string) => ({
  type: GROUP_MEMBERSHIP_REQUEST_REJECT_SUCCESS,
  groupId,
  accountId,
});

const rejectGroupMembershipRequestFail = (groupId: string, accountId: string, error?: AxiosError) => ({
  type: GROUP_MEMBERSHIP_REQUEST_REJECT_FAIL,
  groupId,
  accountId,
  error,
});

const changeGroupEditorTitle = (value: string) => ({
  type: GROUP_EDITOR_TITLE_CHANGE,
  value,
});

const changeGroupEditorDescription = (value: string) => ({
  type: GROUP_EDITOR_DESCRIPTION_CHANGE,
  value,
});

const changeGroupEditorPrivacy = (value: boolean) => ({
  type: GROUP_EDITOR_PRIVACY_CHANGE,
  value,
});

const changeGroupEditorMedia = (mediaType: 'header' | 'avatar', file: File) => ({
  type: GROUP_EDITOR_MEDIA_CHANGE,
  mediaType,
  value: file,
});

const resetGroupEditor = () => ({
  type: GROUP_EDITOR_RESET,
});

const submitGroupEditor = (shouldReset?: boolean) => (dispatch: AppDispatch, getState: () => RootState) => {
  const groupId     = getState().group_editor.groupId;
  const displayName = getState().group_editor.displayName;
  const note        = getState().group_editor.note;
  const avatar      = getState().group_editor.avatar;
  const header      = getState().group_editor.header;

  const params: Record<string, any> = {
    display_name: displayName,
    note,
  };

  if (avatar) params.avatar = avatar;
  if (header) params.header = header;

  if (groupId === null) {
    dispatch(createGroup(params, shouldReset));
  } else {
    dispatch(updateGroup(groupId, params, shouldReset));
  }
};

export {
  GROUP_EDITOR_SET,
  GROUP_CREATE_REQUEST,
  GROUP_CREATE_SUCCESS,
  GROUP_CREATE_FAIL,
  GROUP_UPDATE_REQUEST,
  GROUP_UPDATE_SUCCESS,
  GROUP_UPDATE_FAIL,
  GROUP_DELETE_REQUEST,
  GROUP_DELETE_SUCCESS,
  GROUP_DELETE_FAIL,
  GROUP_FETCH_REQUEST,
  GROUP_FETCH_SUCCESS,
  GROUP_FETCH_FAIL,
  GROUPS_FETCH_REQUEST,
  GROUPS_FETCH_SUCCESS,
  GROUPS_FETCH_FAIL,
  GROUP_RELATIONSHIPS_FETCH_REQUEST,
  GROUP_RELATIONSHIPS_FETCH_SUCCESS,
  GROUP_RELATIONSHIPS_FETCH_FAIL,
  GROUP_JOIN_REQUEST,
  GROUP_JOIN_SUCCESS,
  GROUP_JOIN_FAIL,
  GROUP_LEAVE_REQUEST,
  GROUP_LEAVE_SUCCESS,
  GROUP_LEAVE_FAIL,
  GROUP_DELETE_STATUS_REQUEST,
  GROUP_DELETE_STATUS_SUCCESS,
  GROUP_DELETE_STATUS_FAIL,
  GROUP_KICK_REQUEST,
  GROUP_KICK_SUCCESS,
  GROUP_KICK_FAIL,
  GROUP_BLOCKS_FETCH_REQUEST,
  GROUP_BLOCKS_FETCH_SUCCESS,
  GROUP_BLOCKS_FETCH_FAIL,
  GROUP_BLOCKS_EXPAND_REQUEST,
  GROUP_BLOCKS_EXPAND_SUCCESS,
  GROUP_BLOCKS_EXPAND_FAIL,
  GROUP_BLOCK_REQUEST,
  GROUP_BLOCK_SUCCESS,
  GROUP_BLOCK_FAIL,
  GROUP_UNBLOCK_REQUEST,
  GROUP_UNBLOCK_SUCCESS,
  GROUP_UNBLOCK_FAIL,
  GROUP_PROMOTE_REQUEST,
  GROUP_PROMOTE_SUCCESS,
  GROUP_PROMOTE_FAIL,
  GROUP_DEMOTE_REQUEST,
  GROUP_DEMOTE_SUCCESS,
  GROUP_DEMOTE_FAIL,
  GROUP_MEMBERSHIPS_FETCH_REQUEST,
  GROUP_MEMBERSHIPS_FETCH_SUCCESS,
  GROUP_MEMBERSHIPS_FETCH_FAIL,
  GROUP_MEMBERSHIPS_EXPAND_REQUEST,
  GROUP_MEMBERSHIPS_EXPAND_SUCCESS,
  GROUP_MEMBERSHIPS_EXPAND_FAIL,
  GROUP_MEMBERSHIP_REQUESTS_FETCH_REQUEST,
  GROUP_MEMBERSHIP_REQUESTS_FETCH_SUCCESS,
  GROUP_MEMBERSHIP_REQUESTS_FETCH_FAIL,
  GROUP_MEMBERSHIP_REQUESTS_EXPAND_REQUEST,
  GROUP_MEMBERSHIP_REQUESTS_EXPAND_SUCCESS,
  GROUP_MEMBERSHIP_REQUESTS_EXPAND_FAIL,
  GROUP_MEMBERSHIP_REQUEST_AUTHORIZE_REQUEST,
  GROUP_MEMBERSHIP_REQUEST_AUTHORIZE_SUCCESS,
  GROUP_MEMBERSHIP_REQUEST_AUTHORIZE_FAIL,
  GROUP_MEMBERSHIP_REQUEST_REJECT_REQUEST,
  GROUP_MEMBERSHIP_REQUEST_REJECT_SUCCESS,
  GROUP_MEMBERSHIP_REQUEST_REJECT_FAIL,
  GROUP_EDITOR_TITLE_CHANGE,
  GROUP_EDITOR_DESCRIPTION_CHANGE,
  GROUP_EDITOR_PRIVACY_CHANGE,
  GROUP_EDITOR_MEDIA_CHANGE,
  GROUP_EDITOR_RESET,
  editGroup,
  createGroup,
  createGroupRequest,
  createGroupSuccess,
  createGroupFail,
  updateGroup,
  updateGroupRequest,
  updateGroupSuccess,
  updateGroupFail,
  deleteGroup,
  deleteGroupRequest,
  deleteGroupSuccess,
  deleteGroupFail,
  fetchGroup,
  fetchGroupRequest,
  fetchGroupSuccess,
  fetchGroupFail,
  fetchGroups,
  fetchGroupsRequest,
  fetchGroupsSuccess,
  fetchGroupsFail,
  fetchGroupRelationships,
  fetchGroupRelationshipsRequest,
  fetchGroupRelationshipsSuccess,
  fetchGroupRelationshipsFail,
  joinGroup,
  leaveGroup,
  joinGroupRequest,
  joinGroupSuccess,
  joinGroupFail,
  leaveGroupRequest,
  leaveGroupSuccess,
  leaveGroupFail,
  groupDeleteStatus,
  groupDeleteStatusRequest,
  groupDeleteStatusSuccess,
  groupDeleteStatusFail,
  groupKick,
  groupKickRequest,
  groupKickSuccess,
  groupKickFail,
  fetchGroupBlocks,
  fetchGroupBlocksRequest,
  fetchGroupBlocksSuccess,
  fetchGroupBlocksFail,
  expandGroupBlocks,
  expandGroupBlocksRequest,
  expandGroupBlocksSuccess,
  expandGroupBlocksFail,
  groupBlock,
  groupBlockRequest,
  groupBlockSuccess,
  groupBlockFail,
  groupUnblock,
  groupUnblockRequest,
  groupUnblockSuccess,
  groupUnblockFail,
  groupPromoteAccount,
  groupPromoteAccountRequest,
  groupPromoteAccountSuccess,
  groupPromoteAccountFail,
  groupDemoteAccount,
  groupDemoteAccountRequest,
  groupDemoteAccountSuccess,
  groupDemoteAccountFail,
  fetchGroupMemberships,
  fetchGroupMembershipsRequest,
  fetchGroupMembershipsSuccess,
  fetchGroupMembershipsFail,
  expandGroupMemberships,
  expandGroupMembershipsRequest,
  expandGroupMembershipsSuccess,
  expandGroupMembershipsFail,
  fetchGroupMembershipRequests,
  fetchGroupMembershipRequestsRequest,
  fetchGroupMembershipRequestsSuccess,
  fetchGroupMembershipRequestsFail,
  expandGroupMembershipRequests,
  expandGroupMembershipRequestsRequest,
  expandGroupMembershipRequestsSuccess,
  expandGroupMembershipRequestsFail,
  authorizeGroupMembershipRequest,
  authorizeGroupMembershipRequestRequest,
  authorizeGroupMembershipRequestSuccess,
  authorizeGroupMembershipRequestFail,
  rejectGroupMembershipRequest,
  rejectGroupMembershipRequestRequest,
  rejectGroupMembershipRequestSuccess,
  rejectGroupMembershipRequestFail,
  changeGroupEditorTitle,
  changeGroupEditorDescription,
  changeGroupEditorPrivacy,
  changeGroupEditorMedia,
  resetGroupEditor,
  submitGroupEditor,
};
