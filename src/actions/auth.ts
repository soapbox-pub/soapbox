/**
 * Auth: login & registration workflow.
 * This file contains abstractions over auth concepts.
 * @module soapbox/actions/auth
 * @see module:soapbox/actions/apps
 * @see module:soapbox/actions/oauth
 * @see module:soapbox/actions/security
 */

import { defineMessages } from 'react-intl';

import { createAccount } from 'soapbox/actions/accounts.ts';
import { createApp } from 'soapbox/actions/apps.ts';
import { fetchMeSuccess, fetchMeFail } from 'soapbox/actions/me.ts';
import { obtainOAuthToken, revokeOAuthToken } from 'soapbox/actions/oauth.ts';
import { startOnboarding } from 'soapbox/actions/onboarding.ts';
import { HTTPError } from 'soapbox/api/HTTPError.ts';
import { custom } from 'soapbox/custom.ts';
import { queryClient } from 'soapbox/queries/client.ts';
import { selectAccount } from 'soapbox/selectors/index.ts';
import { unsetSentryAccount } from 'soapbox/sentry.ts';
import toast from 'soapbox/toast.tsx';
import { getLoggedInAccount, parseBaseURL } from 'soapbox/utils/auth.ts';
import sourceCode from 'soapbox/utils/code.ts';
import { normalizeUsername } from 'soapbox/utils/input.ts';
import { getScopes } from 'soapbox/utils/scopes.ts';

import api, { baseClient } from '../api/index.ts';

import { importFetchedAccount } from './importer/index.ts';

import type { AppDispatch, RootState } from 'soapbox/store.ts';

export const SWITCH_ACCOUNT = 'SWITCH_ACCOUNT';

export const AUTH_APP_CREATED    = 'AUTH_APP_CREATED';
export const AUTH_APP_AUTHORIZED = 'AUTH_APP_AUTHORIZED';
export const AUTH_LOGGED_IN      = 'AUTH_LOGGED_IN';
export const AUTH_LOGGED_OUT     = 'AUTH_LOGGED_OUT';

export const VERIFY_CREDENTIALS_REQUEST = 'VERIFY_CREDENTIALS_REQUEST';
export const VERIFY_CREDENTIALS_SUCCESS = 'VERIFY_CREDENTIALS_SUCCESS';
export const VERIFY_CREDENTIALS_FAIL    = 'VERIFY_CREDENTIALS_FAIL';

export const AUTH_ACCOUNT_REMEMBER_REQUEST = 'AUTH_ACCOUNT_REMEMBER_REQUEST';
export const AUTH_ACCOUNT_REMEMBER_SUCCESS = 'AUTH_ACCOUNT_REMEMBER_SUCCESS';
export const AUTH_ACCOUNT_REMEMBER_FAIL    = 'AUTH_ACCOUNT_REMEMBER_FAIL';

const customApp = custom('app');

export const messages = defineMessages({
  loggedOut: { id: 'auth.logged_out', defaultMessage: 'Logged out.' },
  awaitingApproval: { id: 'auth.awaiting_approval', defaultMessage: 'Your account is awaiting approval' },
  invalidCredentials: { id: 'auth.invalid_credentials', defaultMessage: 'Wrong username or password' },
});

const noOp = () => new Promise(f => f(undefined));

const createAppAndToken = () =>
  (dispatch: AppDispatch) =>
    dispatch(getAuthApp()).then(() =>
      dispatch(createAppToken()),
    );

/** Create an auth app, or use it from build config */
const getAuthApp = () =>
  (dispatch: AppDispatch) => {
    if (customApp?.client_secret) {
      return noOp().then(() => dispatch({ type: AUTH_APP_CREATED, app: customApp }));
    } else {
      return dispatch(createAuthApp());
    }
  };

const createAuthApp = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const params = {
      client_name:   sourceCode.displayName,
      redirect_uris: 'urn:ietf:wg:oauth:2.0:oob',
      scopes:        getScopes(getState()),
      website:       sourceCode.homepage,
    };

    return dispatch(createApp(params)).then((app: Record<string, string>) =>
      dispatch({ type: AUTH_APP_CREATED, app }),
    );
  };

const createAppToken = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const app = getState().auth.app;

    const params = {
      client_id:     app?.client_id,
      client_secret: app?.client_secret,
      redirect_uri:  'urn:ietf:wg:oauth:2.0:oob',
      grant_type:    'client_credentials',
      scope:         getScopes(getState()),
    };

    return dispatch(obtainOAuthToken(params)).then((token: Record<string, string | number>) =>
      dispatch({ type: AUTH_APP_AUTHORIZED, app, token }),
    );
  };

const createUserToken = (username: string, password: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const app = getState().auth.app;

    const params = {
      client_id:     app?.client_id,
      client_secret: app?.client_secret,
      redirect_uri:  'urn:ietf:wg:oauth:2.0:oob',
      grant_type:    'password',
      username:      username,
      password:      password,
      scope:         getScopes(getState()),
    };

    return dispatch(obtainOAuthToken(params))
      .then((token: Record<string, string | number>) => dispatch(authLoggedIn(token)));
  };

export const otpVerify = (code: string, mfa_token: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const app = getState().auth.app;
    return api(getState, 'app').post('/oauth/mfa/challenge', {
      client_id: app?.client_id,
      client_secret: app?.client_secret,
      mfa_token: mfa_token,
      code: code,
      challenge_type: 'totp',
      redirect_uri: 'urn:ietf:wg:oauth:2.0:oob',
      scope: getScopes(getState()),
    }).then((response) => response.json()).then((token) => dispatch(authLoggedIn(token)));
  };

export const verifyCredentials = (token: string, accountUrl?: string) => {
  const baseURL = parseBaseURL(accountUrl);

  return (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: VERIFY_CREDENTIALS_REQUEST, token });

    return baseClient(token, baseURL).get('/api/v1/accounts/verify_credentials').then((response) => response.json()).then((account) => {
      dispatch(importFetchedAccount(account));
      dispatch({ type: VERIFY_CREDENTIALS_SUCCESS, token, account });
      if (account.id === getState().me) dispatch(fetchMeSuccess(account));
      return account;
    }).catch(error => {
      if (error?.response?.status === 403 && error?.response?.data?.id) {
        // The user is waitlisted
        const account = error.data;
        dispatch(importFetchedAccount(account));
        dispatch({ type: VERIFY_CREDENTIALS_SUCCESS, token, account });
        if (account.id === getState().me) dispatch(fetchMeSuccess(account));
        return account;
      } else {
        if (getState().me === null) dispatch(fetchMeFail(error));
        dispatch({ type: VERIFY_CREDENTIALS_FAIL, token, error });
        throw error;
      }
    });
  };
};

export class MfaRequiredError extends Error {

  constructor(public token: string) {
    super('MFA is required');
  }

}

export const logIn = (username: string, password: string) =>
  (dispatch: AppDispatch) => dispatch(getAuthApp()).then(() => {
    return dispatch(createUserToken(normalizeUsername(username), password));
  }).catch(async (error) => {
    if (error instanceof HTTPError) {
      const data = await error.response.error();
      if (data) {
        if (data.error === 'mfa_required' && 'mfa_token' in data && typeof data.mfa_token === 'string') {
          // If MFA is required, throw the error and handle it in the component.
          throw new MfaRequiredError(data.mfa_token);
        } else if (data.error === 'awaiting_approval') {
          toast.error(messages.awaitingApproval);
        } else {
          // Return "wrong password" message.
          toast.error(messages.invalidCredentials);
        }
      }
    }
    throw error;
  });

export const deleteSession = () =>
  (dispatch: AppDispatch, getState: () => RootState) => api(getState).delete('/api/sign_out');

export const logOut = (refresh = true) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const account = getLoggedInAccount(state);

    if (!account) return dispatch(noOp);

    const params = {
      client_id: state.auth.app?.client_id,
      client_secret: state.auth.app?.client_secret,
      token: state.auth.users[account.url]?.access_token,
    };

    return dispatch(revokeOAuthToken(params as Record<string, string>))
      .finally(() => {
        // Clear all stored cache from React Query
        queryClient.invalidateQueries();
        queryClient.clear();

        // Clear the account from Sentry.
        unsetSentryAccount();

        // Remove external auth entries.
        localStorage.removeItem('soapbox:external:app');
        localStorage.removeItem('soapbox:external:baseurl');
        localStorage.removeItem('soapbox:external:scopes');

        dispatch({ type: AUTH_LOGGED_OUT, account, refresh });

        toast.success(messages.loggedOut);
      });
  };

export const switchAccount = (accountId: string, background = false) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const account = selectAccount(getState(), accountId);
    // Clear all stored cache from React Query
    queryClient.invalidateQueries();
    queryClient.clear();

    return dispatch({ type: SWITCH_ACCOUNT, account, background });
  };

export const fetchOwnAccounts = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    return Object.values(state.auth.users).forEach((user) => {
      const account = selectAccount(state, user.id);
      if (!account) {
        dispatch(verifyCredentials(user.access_token, user.url))
          .catch(() => console.warn(`Failed to load account: ${user.url}`));
      }
    });
  };

export const register = (params: Record<string, any>) =>
  (dispatch: AppDispatch) => {
    params.fullname = params.username;

    return dispatch(createAppAndToken())
      .then(() => dispatch(createAccount(params)))
      .then(({ token }: { token: Record<string, string | number> }) => {
        dispatch(startOnboarding());
        return dispatch(authLoggedIn(token));
      });
  };

export const fetchCaptcha = () =>
  (_dispatch: AppDispatch, getState: () => RootState) => {
    return api(getState).get('/api/pleroma/captcha');
  };

export const authLoggedIn = (token: Record<string, string | number>) =>
  (dispatch: AppDispatch) => {
    dispatch({ type: AUTH_LOGGED_IN, token });
    return token;
  };
