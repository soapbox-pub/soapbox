
import { fetchRelationships } from 'soapbox/actions/accounts';
import { importFetchedAccount, importFetchedAccounts, importFetchedStatuses } from 'soapbox/actions/importer';
import { DittoInstanceCredentials } from 'soapbox/features/admin/manage-ditto-server';
import { accountIdsToAccts } from 'soapbox/selectors';
import { filterBadges, getTagDiff } from 'soapbox/utils/badges';

import api, { getLinks } from '../api';

import { fetchInstance } from './instance';

import type { AxiosResponse } from 'axios';
import type { AppDispatch, RootState } from 'soapbox/store';
import type { APIEntity } from 'soapbox/types/entities';

const ADMIN_CONFIG_FETCH_REQUEST = 'ADMIN_CONFIG_FETCH_REQUEST';
const ADMIN_CONFIG_FETCH_SUCCESS = 'ADMIN_CONFIG_FETCH_SUCCESS';
const ADMIN_CONFIG_FETCH_FAIL    = 'ADMIN_CONFIG_FETCH_FAIL';

const ADMIN_CONFIG_UPDATE_REQUEST = 'ADMIN_CONFIG_UPDATE_REQUEST';
const ADMIN_CONFIG_UPDATE_SUCCESS = 'ADMIN_CONFIG_UPDATE_SUCCESS';
const ADMIN_CONFIG_UPDATE_FAIL    = 'ADMIN_CONFIG_UPDATE_FAIL';

const ADMIN_REPORTS_FETCH_REQUEST = 'ADMIN_REPORTS_FETCH_REQUEST';
const ADMIN_REPORTS_FETCH_SUCCESS = 'ADMIN_REPORTS_FETCH_SUCCESS';
const ADMIN_REPORTS_FETCH_FAIL    = 'ADMIN_REPORTS_FETCH_FAIL';

const ADMIN_REPORTS_PATCH_REQUEST = 'ADMIN_REPORTS_PATCH_REQUEST';
const ADMIN_REPORTS_PATCH_SUCCESS = 'ADMIN_REPORTS_PATCH_SUCCESS';
const ADMIN_REPORTS_PATCH_FAIL    = 'ADMIN_REPORTS_PATCH_FAIL';

const ADMIN_USERS_FETCH_REQUEST = 'ADMIN_USERS_FETCH_REQUEST';
const ADMIN_USERS_FETCH_SUCCESS = 'ADMIN_USERS_FETCH_SUCCESS';
const ADMIN_USERS_FETCH_FAIL    = 'ADMIN_USERS_FETCH_FAIL';

const ADMIN_USERS_DELETE_REQUEST = 'ADMIN_USERS_DELETE_REQUEST';
const ADMIN_USERS_DELETE_SUCCESS = 'ADMIN_USERS_DELETE_SUCCESS';
const ADMIN_USERS_DELETE_FAIL    = 'ADMIN_USERS_DELETE_FAIL';

const ADMIN_USERS_APPROVE_REQUEST = 'ADMIN_USERS_APPROVE_REQUEST';
const ADMIN_USERS_APPROVE_SUCCESS = 'ADMIN_USERS_APPROVE_SUCCESS';
const ADMIN_USERS_APPROVE_FAIL    = 'ADMIN_USERS_APPROVE_FAIL';

const ADMIN_USERS_REJECT_REQUEST = 'ADMIN_USERS_REJECT_REQUEST';
const ADMIN_USERS_REJECT_SUCCESS = 'ADMIN_USERS_REJECT_SUCCESS';
const ADMIN_USERS_REJECT_FAIL    = 'ADMIN_USERS_REJECT_FAIL';

const ADMIN_USERS_DEACTIVATE_REQUEST = 'ADMIN_USERS_DEACTIVATE_REQUEST';
const ADMIN_USERS_DEACTIVATE_SUCCESS = 'ADMIN_USERS_DEACTIVATE_SUCCESS';
const ADMIN_USERS_DEACTIVATE_FAIL    = 'ADMIN_USERS_DEACTIVATE_FAIL';

const ADMIN_STATUS_DELETE_REQUEST = 'ADMIN_STATUS_DELETE_REQUEST';
const ADMIN_STATUS_DELETE_SUCCESS = 'ADMIN_STATUS_DELETE_SUCCESS';
const ADMIN_STATUS_DELETE_FAIL    = 'ADMIN_STATUS_DELETE_FAIL';

const ADMIN_STATUS_TOGGLE_SENSITIVITY_REQUEST = 'ADMIN_STATUS_TOGGLE_SENSITIVITY_REQUEST';
const ADMIN_STATUS_TOGGLE_SENSITIVITY_SUCCESS = 'ADMIN_STATUS_TOGGLE_SENSITIVITY_SUCCESS';
const ADMIN_STATUS_TOGGLE_SENSITIVITY_FAIL    = 'ADMIN_STATUS_TOGGLE_SENSITIVITY_FAIL';

const ADMIN_USERS_TAG_REQUEST = 'ADMIN_USERS_TAG_REQUEST';
const ADMIN_USERS_TAG_SUCCESS = 'ADMIN_USERS_TAG_SUCCESS';
const ADMIN_USERS_TAG_FAIL    = 'ADMIN_USERS_TAG_FAIL';

const ADMIN_USERS_UNTAG_REQUEST = 'ADMIN_USERS_UNTAG_REQUEST';
const ADMIN_USERS_UNTAG_SUCCESS = 'ADMIN_USERS_UNTAG_SUCCESS';
const ADMIN_USERS_UNTAG_FAIL    = 'ADMIN_USERS_UNTAG_FAIL';

const ADMIN_ADD_PERMISSION_GROUP_REQUEST = 'ADMIN_ADD_PERMISSION_GROUP_REQUEST';
const ADMIN_ADD_PERMISSION_GROUP_SUCCESS = 'ADMIN_ADD_PERMISSION_GROUP_SUCCESS';
const ADMIN_ADD_PERMISSION_GROUP_FAIL    = 'ADMIN_ADD_PERMISSION_GROUP_FAIL';

const ADMIN_REMOVE_PERMISSION_GROUP_REQUEST = 'ADMIN_REMOVE_PERMISSION_GROUP_REQUEST';
const ADMIN_REMOVE_PERMISSION_GROUP_SUCCESS = 'ADMIN_REMOVE_PERMISSION_GROUP_SUCCESS';
const ADMIN_REMOVE_PERMISSION_GROUP_FAIL    = 'ADMIN_REMOVE_PERMISSION_GROUP_FAIL';

const fetchConfig = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: ADMIN_CONFIG_FETCH_REQUEST });
    return api(getState)
      .get('/api/v1/pleroma/admin/config')
      .then(({ data }) => {
        dispatch({ type: ADMIN_CONFIG_FETCH_SUCCESS, configs: data.configs, needsReboot: data.need_reboot });
      }).catch(error => {
        dispatch({ type: ADMIN_CONFIG_FETCH_FAIL, error });
      });
  };

const updateConfig = (configs: Record<string, any>[]) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: ADMIN_CONFIG_UPDATE_REQUEST, configs });
    return api(getState)
      .post('/api/v1/pleroma/admin/config', { configs })
      .then(({ data }) => {
        dispatch({ type: ADMIN_CONFIG_UPDATE_SUCCESS, configs: data.configs, needsReboot: data.need_reboot });
      }).catch(error => {
        dispatch({ type: ADMIN_CONFIG_UPDATE_FAIL, error, configs });
      });
  };

const updateSoapboxConfig = (data: Record<string, any>) =>
  (dispatch: AppDispatch, _getState: () => RootState) => {
    const params = [{
      group: ':pleroma',
      key: ':frontend_configurations',
      value: [{
        tuple: [':soapbox_fe', data],
      }],
    }];

    return dispatch(updateConfig(params));
  };

function putDittoInstance(data: DittoInstanceCredentials) {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    await api(getState).put('/api/v1/admin/ditto/instance', data);
    await dispatch(fetchInstance());
  };
}

function fetchReports(params: Record<string, any> = {}) {
  return async (dispatch: AppDispatch, getState: () => RootState): Promise<void> => {
    dispatch({ type: ADMIN_REPORTS_FETCH_REQUEST, params });

    try {
      const { data: reports } = await api(getState).get('/api/v1/admin/reports', { params });
      reports.forEach((report: APIEntity) => {
        dispatch(importFetchedAccount(report.account?.account));
        dispatch(importFetchedAccount(report.target_account?.account));
        dispatch(importFetchedStatuses(report.statuses));
      });
      dispatch({ type: ADMIN_REPORTS_FETCH_SUCCESS, reports, params });
    } catch (error) {
      dispatch({ type: ADMIN_REPORTS_FETCH_FAIL, error, params });
    }
  };
}

function patchReports(ids: string[], reportState: string) {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    const reports = ids.map(id => ({ id, state: reportState }));

    dispatch({ type: ADMIN_REPORTS_PATCH_REQUEST, reports });

    return Promise.all(
      reports.map(async ({ id, state }) => {
        try {
          await api(getState).post(`/api/v1/admin/reports/${id}/${state === 'resolved' ? 'reopen' : 'resolve'}`);
          dispatch({ type: ADMIN_REPORTS_PATCH_SUCCESS, reports });
        } catch (error) {
          dispatch({ type: ADMIN_REPORTS_PATCH_FAIL, error, reports });
        }
      },
      ),
    );
  };
}

function closeReports(ids: string[]) {
  return patchReports(ids, 'closed');
}

function fetchUsers(filters: Record<string, boolean>, page = 1, query?: string | null, pageSize = 50, url?: string | null) {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: ADMIN_USERS_FETCH_REQUEST, filters, page, pageSize });

    const params: Record<string, any> = {
      ...filters,
      username: query,
    };

    try {
      const { data: accounts, ...response } = await api(getState).get(url || '/api/v1/admin/accounts', { params });
      const next = getLinks(response as AxiosResponse<any, any>).refs.find(link => link.rel === 'next')?.uri;

      dispatch(importFetchedAccounts(accounts.map(({ account }: APIEntity) => account)));
      dispatch(fetchRelationships(accounts.map((account_1: APIEntity) => account_1.id)));
      dispatch({ type: ADMIN_USERS_FETCH_SUCCESS, accounts, pageSize, filters, page, next });
      return { accounts, next };
    } catch (error) {
      return dispatch({ type: ADMIN_USERS_FETCH_FAIL, error, filters, page, pageSize });
    }
  };
}

function revokeName(accountId: string, reportId?: string) {
  return (_dispatch: AppDispatch, getState: () => RootState) => {
    const params = {
      type: 'revoke_name',
      report_id: reportId,
    };

    return api(getState).post(`/api/v1/admin/accounts/${accountId}/action`, params);
  };
}

function deactivateUsers(accountIds: string[], reportId?: string) {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    return Promise.all(
      accountIds.map(async (accountId) => {
        const params = {
          type: 'disable',
          report_id: reportId,
        };
        try {
          await api(getState).post(`/api/v1/admin/accounts/${accountId}/action`, params);
          dispatch({ type: ADMIN_USERS_DEACTIVATE_SUCCESS, accountIds: [accountId] });
        } catch (error) {
          dispatch({ type: ADMIN_USERS_DEACTIVATE_FAIL, error, accountIds: [accountId] });
        }
      }),
    );
  };
}

const deleteUser = (accountId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const nicknames = accountIdsToAccts(getState(), [accountId]);
    dispatch({ type: ADMIN_USERS_DELETE_REQUEST, accountId });
    return api(getState)
      .delete('/api/v1/pleroma/admin/users', { data: { nicknames } })
      .then(({ data: nicknames }) => {
        dispatch({ type: ADMIN_USERS_DELETE_SUCCESS, nicknames, accountId });
      }).catch(error => {
        dispatch({ type: ADMIN_USERS_DELETE_FAIL, error, accountId });
      });
  };

function approveUser(accountId: string) {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: ADMIN_USERS_APPROVE_REQUEST, accountId });
    try {
      const { data: user } = await api(getState)
        .post(`/api/v1/admin/accounts/${accountId}/approve`);
      dispatch({ type: ADMIN_USERS_APPROVE_SUCCESS, user, accountId });
    } catch (error) {
      dispatch({ type: ADMIN_USERS_APPROVE_FAIL, error, accountId });
    }
  };
}

function rejectUser(accountId: string) {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: ADMIN_USERS_REJECT_REQUEST, accountId });
    try {
      const { data: user } = await api(getState)
        .post(`/api/v1/admin/accounts/${accountId}/reject`);
      dispatch({ type: ADMIN_USERS_REJECT_SUCCESS, user, accountId });
    } catch (error) {
      dispatch({ type: ADMIN_USERS_REJECT_FAIL, error, accountId });
    }
  };
}

const deleteStatus = (id: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: ADMIN_STATUS_DELETE_REQUEST, id });
    return api(getState)
      .delete(`/api/v1/pleroma/admin/statuses/${id}`)
      .then(() => {
        dispatch({ type: ADMIN_STATUS_DELETE_SUCCESS, id });
      }).catch(error => {
        dispatch({ type: ADMIN_STATUS_DELETE_FAIL, error, id });
      });
  };

const toggleStatusSensitivity = (id: string, sensitive: boolean) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: ADMIN_STATUS_TOGGLE_SENSITIVITY_REQUEST, id });
    return api(getState)
      .put(`/api/v1/pleroma/admin/statuses/${id}`, { sensitive: !sensitive })
      .then(() => {
        dispatch({ type: ADMIN_STATUS_TOGGLE_SENSITIVITY_SUCCESS, id });
      }).catch(error => {
        dispatch({ type: ADMIN_STATUS_TOGGLE_SENSITIVITY_FAIL, error, id });
      });
  };

const tagUsers = (accountIds: string[], tags: string[]) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const nicknames = accountIdsToAccts(getState(), accountIds);
    dispatch({ type: ADMIN_USERS_TAG_REQUEST, accountIds, tags });
    return api(getState)
      .put('/api/v1/pleroma/admin/users/tag', { nicknames, tags })
      .then(() => {
        dispatch({ type: ADMIN_USERS_TAG_SUCCESS, accountIds, tags });
      }).catch(error => {
        dispatch({ type: ADMIN_USERS_TAG_FAIL, error, accountIds, tags });
      });
  };

const untagUsers = (accountIds: string[], tags: string[]) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const nicknames = accountIdsToAccts(getState(), accountIds);

    // Legacy: allow removing legacy 'donor' tags.
    if (tags.includes('badge:donor')) {
      tags = [...tags, 'donor'];
    }

    dispatch({ type: ADMIN_USERS_UNTAG_REQUEST, accountIds, tags });
    return api(getState)
      .delete('/api/v1/pleroma/admin/users/tag', { data: { nicknames, tags } })
      .then(() => {
        dispatch({ type: ADMIN_USERS_UNTAG_SUCCESS, accountIds, tags });
      }).catch(error => {
        dispatch({ type: ADMIN_USERS_UNTAG_FAIL, error, accountIds, tags });
      });
  };

/** Synchronizes user tags to the backend. */
const setTags = (accountId: string, oldTags: string[], newTags: string[]) =>
  async(dispatch: AppDispatch) => {
    const diff = getTagDiff(oldTags, newTags);

    await dispatch(tagUsers([accountId], diff.added));
    await dispatch(untagUsers([accountId], diff.removed));
  };

/** Synchronizes badges to the backend. */
const setBadges = (accountId: string, oldTags: string[], newTags: string[]) =>
  (dispatch: AppDispatch) => {
    const oldBadges = filterBadges(oldTags);
    const newBadges = filterBadges(newTags);

    return dispatch(setTags(accountId, oldBadges, newBadges));
  };

const addPermission = (accountIds: string[], permissionGroup: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const nicknames = accountIdsToAccts(getState(), accountIds);
    dispatch({ type: ADMIN_ADD_PERMISSION_GROUP_REQUEST, accountIds, permissionGroup });
    return api(getState)
      .post(`/api/v1/pleroma/admin/users/permission_group/${permissionGroup}`, { nicknames })
      .then(({ data }) => {
        dispatch({ type: ADMIN_ADD_PERMISSION_GROUP_SUCCESS, accountIds, permissionGroup, data });
      }).catch(error => {
        dispatch({ type: ADMIN_ADD_PERMISSION_GROUP_FAIL, error, accountIds, permissionGroup });
      });
  };

const removePermission = (accountIds: string[], permissionGroup: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const nicknames = accountIdsToAccts(getState(), accountIds);
    dispatch({ type: ADMIN_REMOVE_PERMISSION_GROUP_REQUEST, accountIds, permissionGroup });
    return api(getState)
      .delete(`/api/v1/pleroma/admin/users/permission_group/${permissionGroup}`, { data: { nicknames } })
      .then(({ data }) => {
        dispatch({ type: ADMIN_REMOVE_PERMISSION_GROUP_SUCCESS, accountIds, permissionGroup, data });
      }).catch(error => {
        dispatch({ type: ADMIN_REMOVE_PERMISSION_GROUP_FAIL, error, accountIds, permissionGroup });
      });
  };

const promoteToAdmin = (accountId: string) =>
  (dispatch: AppDispatch) =>
    Promise.all([
      dispatch(addPermission([accountId], 'admin')),
      dispatch(removePermission([accountId], 'moderator')),
    ]);

const promoteToModerator = (accountId: string) =>
  (dispatch: AppDispatch) =>
    Promise.all([
      dispatch(removePermission([accountId], 'admin')),
      dispatch(addPermission([accountId], 'moderator')),
    ]);

const demoteToUser = (accountId: string) =>
  (dispatch: AppDispatch) =>
    Promise.all([
      dispatch(removePermission([accountId], 'admin')),
      dispatch(removePermission([accountId], 'moderator')),
    ]);

const setRole = (accountId: string, role: 'user' | 'moderator' | 'admin') =>
  (dispatch: AppDispatch) => {
    switch (role) {
      case 'user':
        return dispatch(demoteToUser(accountId));
      case 'moderator':
        return dispatch(promoteToModerator(accountId));
      case 'admin':
        return dispatch(promoteToAdmin(accountId));
    }
  };

export {
  ADMIN_CONFIG_FETCH_REQUEST,
  ADMIN_CONFIG_FETCH_SUCCESS,
  ADMIN_CONFIG_FETCH_FAIL,
  ADMIN_CONFIG_UPDATE_REQUEST,
  ADMIN_CONFIG_UPDATE_SUCCESS,
  ADMIN_CONFIG_UPDATE_FAIL,
  ADMIN_REPORTS_FETCH_REQUEST,
  ADMIN_REPORTS_FETCH_SUCCESS,
  ADMIN_REPORTS_FETCH_FAIL,
  ADMIN_REPORTS_PATCH_REQUEST,
  ADMIN_REPORTS_PATCH_SUCCESS,
  ADMIN_REPORTS_PATCH_FAIL,
  ADMIN_USERS_FETCH_REQUEST,
  ADMIN_USERS_FETCH_SUCCESS,
  ADMIN_USERS_FETCH_FAIL,
  ADMIN_USERS_DELETE_REQUEST,
  ADMIN_USERS_DELETE_SUCCESS,
  ADMIN_USERS_DELETE_FAIL,
  ADMIN_USERS_APPROVE_REQUEST,
  ADMIN_USERS_APPROVE_SUCCESS,
  ADMIN_USERS_APPROVE_FAIL,
  ADMIN_USERS_REJECT_REQUEST,
  ADMIN_USERS_REJECT_SUCCESS,
  ADMIN_USERS_REJECT_FAIL,
  ADMIN_USERS_DEACTIVATE_REQUEST,
  ADMIN_USERS_DEACTIVATE_SUCCESS,
  ADMIN_USERS_DEACTIVATE_FAIL,
  ADMIN_STATUS_DELETE_REQUEST,
  ADMIN_STATUS_DELETE_SUCCESS,
  ADMIN_STATUS_DELETE_FAIL,
  ADMIN_STATUS_TOGGLE_SENSITIVITY_REQUEST,
  ADMIN_STATUS_TOGGLE_SENSITIVITY_SUCCESS,
  ADMIN_STATUS_TOGGLE_SENSITIVITY_FAIL,
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
  fetchConfig,
  updateConfig,
  updateSoapboxConfig,
  fetchReports,
  closeReports,
  fetchUsers,
  deactivateUsers,
  deleteUser,
  approveUser,
  rejectUser,
  revokeName,
  deleteStatus,
  toggleStatusSensitivity,
  tagUsers,
  untagUsers,
  setTags,
  setBadges,
  addPermission,
  removePermission,
  promoteToAdmin,
  promoteToModerator,
  demoteToUser,
  setRole,
  putDittoInstance,
};
