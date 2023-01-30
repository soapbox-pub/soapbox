import { List as ImmutableList } from 'immutable';

import type { RootState } from 'soapbox/store';

export const validId = (id: any) => typeof id === 'string' && id !== 'null' && id !== 'undefined';

export const isURL = (url?: string | null) => {
  if (typeof url !== 'string') return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const parseBaseURL = (url: any) => {
  try {
    return new URL(url).origin;
  } catch {
    return '';
  }
};

export const getLoggedInAccount = (state: RootState) => {
  const me = state.me;
  return state.accounts.get(me);
};

export const isLoggedIn = (getState: () => RootState) => {
  return validId(getState().me);
};

export const getAppToken = (state: RootState) => state.auth.app.access_token as string;

export const getUserToken = (state: RootState, accountId?: string | false | null) => {
  const accountUrl = state.accounts.getIn([accountId, 'url']) as string;
  return state.auth.users.get(accountUrl)?.access_token as string;
};

export const getAccessToken = (state: RootState) => {
  const me = state.me;
  return getUserToken(state, me);
};

export const getAuthUserId = (state: RootState) => {
  const me = state.auth.me;

  return ImmutableList([
    state.auth.users.get(me!)?.id,
    me,
  ].filter(id => id)).find(validId);
};

export const getAuthUserUrl = (state: RootState) => {
  const me = state.auth.me;

  return ImmutableList([
    state.auth.users.get(me!)?.url,
    me,
  ].filter(url => url)).find(isURL);
};

/** Get the VAPID public key. */
export const getVapidKey = (state: RootState) =>
  (state.auth.app.vapid_key || state.instance.pleroma.get('vapid_public_key')) as string;
