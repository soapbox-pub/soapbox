/**
 * OAuth: create and revoke tokens.
 * Tokens can be used by users and apps.
 * https://docs.joinmastodon.org/methods/apps/oauth/
 * @module soapbox/actions/oauth
 * @see module:soapbox/actions/auth
 */

import { getBaseURL } from 'soapbox/utils/state';

import { baseClient } from '../api';

import type { AppDispatch, RootState } from 'soapbox/store';

export const OAUTH_TOKEN_CREATE_REQUEST = 'OAUTH_TOKEN_CREATE_REQUEST';
export const OAUTH_TOKEN_CREATE_SUCCESS = 'OAUTH_TOKEN_CREATE_SUCCESS';
export const OAUTH_TOKEN_CREATE_FAIL    = 'OAUTH_TOKEN_CREATE_FAIL';

export const OAUTH_TOKEN_REVOKE_REQUEST = 'OAUTH_TOKEN_REVOKE_REQUEST';
export const OAUTH_TOKEN_REVOKE_SUCCESS = 'OAUTH_TOKEN_REVOKE_SUCCESS';
export const OAUTH_TOKEN_REVOKE_FAIL    = 'OAUTH_TOKEN_REVOKE_FAIL';

export const obtainOAuthToken = (params: Record<string, string | undefined>, baseURL?: string) =>
  (dispatch: AppDispatch) => {
    dispatch({ type: OAUTH_TOKEN_CREATE_REQUEST, params });
    return baseClient(null, baseURL).post('/oauth/token', params).then(({ data: token }) => {
      dispatch({ type: OAUTH_TOKEN_CREATE_SUCCESS, params, token });
      return token;
    }).catch(error => {
      dispatch({ type: OAUTH_TOKEN_CREATE_FAIL, params, error, skipAlert: true });
      throw error;
    });
  };

export const revokeOAuthToken = (params: Record<string, string>) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: OAUTH_TOKEN_REVOKE_REQUEST, params });
    const baseURL = getBaseURL(getState());
    return baseClient(null, baseURL).post('/oauth/revoke', params).then(({ data }) => {
      dispatch({ type: OAUTH_TOKEN_REVOKE_SUCCESS, params, data });
      return data;
    }).catch(error => {
      dispatch({ type: OAUTH_TOKEN_REVOKE_FAIL, params, error });
      throw error;
    });
  };
