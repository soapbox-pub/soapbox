import * as BuildConfig from '@/build-config.ts';
import { isURL } from '@/utils/auth.ts';
import sourceCode from '@/utils/code.ts';
import { getScopes } from '@/utils/scopes.ts';

import { createApp } from './apps.ts';

import type { AppDispatch, RootState } from '@/store.ts';

const createProviderApp = () => {
  return async(dispatch: AppDispatch, getState: () => RootState) => {
    const scopes = getScopes(getState());

    const params = {
      client_name:   sourceCode.displayName,
      redirect_uris: `${window.location.origin}/login/external`,
      website:       sourceCode.homepage,
      scopes,
    };

    return dispatch(createApp(params));
  };
};

export const prepareRequest = (provider: string) => {
  return async(dispatch: AppDispatch, getState: () => RootState) => {
    const baseURL = isURL(BuildConfig.BACKEND_URL) ? BuildConfig.BACKEND_URL : '';

    const scopes = getScopes(getState());
    const app = await dispatch(createProviderApp());
    const { client_id, redirect_uri } = app;

    localStorage.setItem('soapbox:external:app', JSON.stringify(app));
    localStorage.setItem('soapbox:external:baseurl', baseURL);
    localStorage.setItem('soapbox:external:scopes', scopes);

    const query = new URLSearchParams({ provider });

    // FIXME: I don't know if this is the correct way to encode the query params.
    query.append('authorization.client_id', client_id);
    query.append('authorization.redirect_uri', redirect_uri);
    query.append('authorization.scope', scopes);

    location.href = `${baseURL}/oauth/prepare_request?${query.toString()}`;
  };
};
