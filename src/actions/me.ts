import { selectAccount } from 'soapbox/selectors/index.ts';
import { setSentryAccount } from 'soapbox/sentry.ts';
import { getAuthUserId, getAuthUserUrl } from 'soapbox/utils/auth.ts';

import api from '../api/index.ts';

import { verifyCredentials } from './auth.ts';
import { importFetchedAccount } from './importer/index.ts';

import type { RawAxiosRequestHeaders } from 'axios';
import type { Account } from 'soapbox/schemas/index.ts';
import type { AppDispatch, RootState } from 'soapbox/store.ts';
import type { APIEntity } from 'soapbox/types/entities.ts';

const ME_FETCH_REQUEST = 'ME_FETCH_REQUEST' as const;
const ME_FETCH_SUCCESS = 'ME_FETCH_SUCCESS' as const;
const ME_FETCH_FAIL    = 'ME_FETCH_FAIL' as const;
const ME_FETCH_SKIP    = 'ME_FETCH_SKIP' as const;

const ME_PATCH_REQUEST = 'ME_PATCH_REQUEST' as const;
const ME_PATCH_SUCCESS = 'ME_PATCH_SUCCESS' as const;
const ME_PATCH_FAIL    = 'ME_PATCH_FAIL' as const;

const noOp = () => new Promise(f => f(undefined));

const getMeId = (state: RootState) => state.me || getAuthUserId(state);

const getMeUrl = (state: RootState) => {
  const accountId = getMeId(state);
  if (accountId) {
    return selectAccount(state, accountId)?.url || getAuthUserUrl(state);
  }
};

function getMeToken(state: RootState): string | undefined {
  // Fallback for upgrading IDs to URLs
  const accountUrl = getMeUrl(state) || state.auth.me;
  return state.auth.users[accountUrl!]?.access_token;
}

const fetchMe = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const token = getMeToken(state);
    const accountUrl = getMeUrl(state);

    if (!token) {
      dispatch({ type: ME_FETCH_SKIP });
      return noOp();
    }

    dispatch(fetchMeRequest());
    return dispatch(verifyCredentials(token, accountUrl!))
      .catch(error => dispatch(fetchMeFail(error)));
  };

const patchMe = (params: Record<string, any>, isFormData = false) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(patchMeRequest());

    const headers: RawAxiosRequestHeaders = isFormData ? {
      'Content-Type': 'multipart/form-data',
    } : {};

    return api(getState)
      .patch('/api/v1/accounts/update_credentials', params, { headers })
      .then(response => {
        dispatch(patchMeSuccess(response.data));
      }).catch(error => {
        dispatch(patchMeFail(error));
        throw error;
      });
  };

const fetchMeRequest = () => ({
  type: ME_FETCH_REQUEST,
});

const fetchMeSuccess = (account: Account) => {
  setSentryAccount(account);

  return {
    type: ME_FETCH_SUCCESS,
    me: account,
  };
};

const fetchMeFail = (error: APIEntity) => ({
  type: ME_FETCH_FAIL,
  error,
  skipAlert: true,
});

const patchMeRequest = () => ({
  type: ME_PATCH_REQUEST,
});

interface MePatchSuccessAction {
  type: typeof ME_PATCH_SUCCESS;
  me: APIEntity;
}

const patchMeSuccess = (me: APIEntity) =>
  (dispatch: AppDispatch) => {
    const action: MePatchSuccessAction = {
      type: ME_PATCH_SUCCESS,
      me,
    };

    dispatch(importFetchedAccount(me));
    dispatch(action);
  };

const patchMeFail = (error: unknown) => ({
  type: ME_PATCH_FAIL,
  error,
  skipAlert: true,
});

type MeAction =
  | ReturnType<typeof fetchMeRequest>
  | ReturnType<typeof fetchMeSuccess>
  | ReturnType<typeof fetchMeFail>
  | ReturnType<typeof patchMeRequest>
  | MePatchSuccessAction
  | ReturnType<typeof patchMeFail>;

export {
  ME_FETCH_REQUEST,
  ME_FETCH_SUCCESS,
  ME_FETCH_FAIL,
  ME_FETCH_SKIP,
  ME_PATCH_REQUEST,
  ME_PATCH_SUCCESS,
  ME_PATCH_FAIL,
  fetchMe,
  patchMe,
  fetchMeRequest,
  fetchMeSuccess,
  fetchMeFail,
  patchMeRequest,
  patchMeSuccess,
  patchMeFail,
  type MeAction,
};
