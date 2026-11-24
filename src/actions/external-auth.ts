/**
 * External Auth: workflow for logging in to remote servers.
 * @module soapbox/actions/external_auth
 * @see module:soapbox/actions/auth
 * @see module:soapbox/actions/apps
 * @see module:soapbox/actions/oauth
 */

import { createApp } from '@/actions/apps.ts';
import { authLoggedIn, verifyCredentials, switchAccount } from '@/actions/auth.ts';
import { obtainOAuthToken } from '@/actions/oauth.ts';
import { InstanceV1, instanceV1Schema } from '@/schemas/instance.ts';
import { parseBaseURL } from '@/utils/auth.ts';
import sourceCode from '@/utils/code.ts';
import { getInstanceScopes } from '@/utils/scopes.ts';

import { baseClient } from '../api/index.ts';

import type { AppDispatch, RootState } from '@/store.ts';

const fetchExternalInstance = (baseURL?: string) => {
  return baseClient(null, baseURL)
    .get('/api/v1/instance')
    .then((response) => response.json()).then((instance) => instanceV1Schema.parse(instance))
    .catch(error => {
      if (error.response?.status === 401) {
        // Authenticated fetch is enabled.
        // Continue with a limited featureset.
        return instanceV1Schema.parse({});
      } else {
        throw error;
      }
    });
};

const createExternalApp = (instance: InstanceV1, baseURL?: string) =>
  (dispatch: AppDispatch, _getState: () => RootState) => {
    const params = {
      client_name: sourceCode.displayName,
      redirect_uris: `${window.location.origin}/login/external`,
      website: sourceCode.homepage,
      scopes: getInstanceScopes(instance.version),
    };

    return dispatch(createApp(params, baseURL));
  };

const externalAuthorize = (instance: InstanceV1, baseURL: string) =>
  (dispatch: AppDispatch, _getState: () => RootState) => {
    const scopes = getInstanceScopes(instance.version);

    return dispatch(createExternalApp(instance, baseURL)).then((app) => {
      const { client_id, redirect_uri } = app as Record<string, string>;

      // Random value the server sends back with the code, so we only accept codes
      // from a login this browser started.
      const state = crypto.randomUUID();

      const query = new URLSearchParams({
        client_id,
        redirect_uri,
        response_type: 'code',
        scope: scopes,
        state,
      });

      localStorage.setItem('soapbox:external:app', JSON.stringify(app));
      localStorage.setItem('soapbox:external:baseurl', baseURL);
      localStorage.setItem('soapbox:external:scopes', scopes);
      localStorage.setItem('soapbox:external:state', state);

      window.location.href = `${baseURL}/oauth/authorize?${query.toString()}`;
    });
  };

export const externalLogin = (host: string) =>
  (dispatch: AppDispatch) => {
    const baseURL = parseBaseURL(host) || parseBaseURL(`https://${host}`);

    return fetchExternalInstance(baseURL).then((instance) => {
      dispatch(externalAuthorize(instance, baseURL));
    });
  };

/** Forget the app and settings of an external login in progress. */
export const clearExternalAuth = () => {
  localStorage.removeItem('soapbox:external:app');
  localStorage.removeItem('soapbox:external:baseurl');
  localStorage.removeItem('soapbox:external:scopes');
  localStorage.removeItem('soapbox:external:state');
};

export const loginWithCode = (code: string, state?: string | null) =>
  (dispatch: AppDispatch) => {
    const app = localStorage.getItem('soapbox:external:app');
    const expectedState = localStorage.getItem('soapbox:external:state');

    // Only finish a login this browser started. Without this, a link with someone else's
    // code could log the user in to an account of the attacker's choosing.
    // (Provider logins through `prepareRequest` don't send a state, and store none.)
    if (!app || (expectedState && state !== expectedState)) {
      clearExternalAuth();
      return Promise.reject(new Error('No matching login in progress'));
    }

    const { client_id, client_secret, redirect_uri } = JSON.parse(app);
    const baseURL = localStorage.getItem('soapbox:external:baseurl')!;
    const scope   = localStorage.getItem('soapbox:external:scopes')!;

    const params: Record<string, string> = {
      client_id,
      client_secret,
      redirect_uri,
      grant_type: 'authorization_code',
      scope,
      code,
    };

    return dispatch(obtainOAuthToken(params, baseURL))
      .then((token: Record<string, string | number>) => dispatch(authLoggedIn(token)))
      .then(({ access_token }: any) => dispatch(verifyCredentials(access_token as string, baseURL)))
      .then((account: { id: string }) => dispatch(switchAccount(account.id)))
      .then(() => clearExternalAuth())
      .then(() => window.location.href = '/');
  };
