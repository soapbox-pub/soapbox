import { createSelector } from 'reselect';

import { MastodonClient } from 'soapbox/api/MastodonClient.ts';
import * as BuildConfig from 'soapbox/build-config.ts';
import { selectAccount } from 'soapbox/selectors/index.ts';
import { RootState } from 'soapbox/store.ts';
import { getAccessToken, getAppToken, parseBaseURL } from 'soapbox/utils/auth.ts';

const getToken = (state: RootState, authType: string) => {
  return authType === 'app' ? getAppToken(state) : getAccessToken(state);
};

const getAuthBaseURL = createSelector([
  (state: RootState, me: string | false | null) => me ? selectAccount(state, me)?.url : undefined,
  (state: RootState, _me: string | false | null) => state.auth.me,
], (accountUrl, authUserUrl) => {
  return parseBaseURL(accountUrl) || parseBaseURL(authUserUrl);
});

/** Base client for HTTP requests. */
export const baseClient = (
  accessToken?: string | null,
  baseURL?: string,
): MastodonClient => {
  return new MastodonClient(baseURL || location.origin, accessToken || undefined);
};

/**
 * Stateful API client.
 * Uses credentials from the Redux store if available.
 */
export default (getState: () => RootState, authType: string = 'user'): MastodonClient => {
  const state = getState();
  const accessToken = getToken(state, authType);
  const me = state.me;
  const baseURL = BuildConfig.BACKEND_URL || (me ? getAuthBaseURL(state, me) : undefined) || location.origin;

  return baseClient(accessToken, baseURL);
};
