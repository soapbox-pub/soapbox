/**
 * External Auth: workflow for logging in to remote servers.
 * @module soapbox/actions/external_auth
 * @see module:soapbox/actions/auth
 * @see module:soapbox/actions/apps
 * @see module:soapbox/actions/oauth
 */

import { createApp } from 'soapbox/actions/apps.ts';
import { authLoggedIn, verifyCredentials, switchAccount } from 'soapbox/actions/auth.ts';
import { obtainOAuthToken } from 'soapbox/actions/oauth.ts';
import { InstanceV1, instanceV1Schema } from 'soapbox/schemas/instance.ts';
import { parseBaseURL } from 'soapbox/utils/auth.ts';
import sourceCode from 'soapbox/utils/code.ts';
import { getInstanceScopes } from 'soapbox/utils/scopes.ts';

import { baseClient } from '../api/index.ts';

import type { AppDispatch, RootState } from 'soapbox/store.ts';

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

      const query = new URLSearchParams({
        client_id,
        redirect_uri,
        response_type: 'code',
        scope: scopes,
      });

      localStorage.setItem('soapbox:external:app', JSON.stringify(app));
      localStorage.setItem('soapbox:external:baseurl', baseURL);
      localStorage.setItem('soapbox:external:scopes', scopes);

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

export const loginWithCode = (code: string) =>
  (dispatch: AppDispatch) => {
    const { client_id, client_secret, redirect_uri } = JSON.parse(localStorage.getItem('soapbox:external:app')!);
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
      .then(() => localStorage.removeItem('soapbox:external:baseurl'))
      .then(() => window.location.href = '/');
  };
