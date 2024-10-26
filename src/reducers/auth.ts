import { AxiosError } from 'axios';
import { produce } from 'immer';
import { z } from 'zod';

import { Account, accountSchema } from 'soapbox/schemas';
import { Application, applicationSchema } from 'soapbox/schemas/application';
import { AuthUser, SoapboxAuth, soapboxAuthSchema } from 'soapbox/schemas/soapbox/soapbox-auth';
import { Token, tokenSchema } from 'soapbox/schemas/token';
import { jsonSchema } from 'soapbox/schemas/utils';

import {
  AUTH_APP_CREATED,
  AUTH_LOGGED_IN,
  AUTH_LOGGED_OUT,
  SWITCH_ACCOUNT,
  VERIFY_CREDENTIALS_SUCCESS,
  VERIFY_CREDENTIALS_FAIL,
  AUTH_APP_AUTHORIZED,
} from '../actions/auth';
import { ME_FETCH_SKIP } from '../actions/me';

import type { UnknownAction } from '@reduxjs/toolkit';

const STORAGE_KEY = 'soapbox:auth';
const SESSION_KEY = 'soapbox:auth:me';

/** Get current user's URL from session storage. */
function getSessionUser(): string | undefined {
  const value = sessionStorage.getItem(SESSION_KEY);
  try {
    return z.string().url().parse(value);
  } catch {
    return undefined;
  }
}

/** Retrieve state from browser storage. */
function getLocalState(): SoapboxAuth | undefined {
  const data = localStorage.getItem(STORAGE_KEY);
  const result = jsonSchema.pipe(soapboxAuthSchema).safeParse(data);

  if (!result.success) {
    return undefined;
  }

  return result.data;
}

/** Serialize and save the auth into localStorage. */
function persistAuth(auth: SoapboxAuth): void {
  const value = JSON.stringify(auth);
  localStorage.setItem(STORAGE_KEY, value);

  if (auth.me) {
    sessionStorage.setItem(SESSION_KEY, auth.me);
  }
}

/** Hydrate the initial state, or create a new state. */
function initialize(): SoapboxAuth {
  const auth = getLocalState() || { tokens: {}, users: {} };
  auth.me = getSessionUser() || auth.me;

  maybeShiftMe(auth);
  persistAuth(auth);

  return auth;
}

/** Initial state of the reducer. */
const initialState = initialize();

/** Import a Token into the state. */
function importToken(auth: SoapboxAuth, token: Token): SoapboxAuth {
  return produce(auth, draft => {
    draft.tokens[token.access_token] = token;
  });
}

/** Import Application into the state. */
function importApplication(auth: SoapboxAuth, app: Application): SoapboxAuth {
  return produce(auth, draft => {
    draft.app = app;
  });
}

/** If the user is not set, set it to the first available user. This mutates the object. */
function maybeShiftMe(auth: SoapboxAuth): void {
  if (!auth.me || !auth.users[auth.me]) {
    auth.me = Object.keys(auth.users)[0];
  }
}

/** Import an Account into the state as an auth user. */
function importCredentials(auth: SoapboxAuth, accessToken: string, account: Account): SoapboxAuth {
  const authUser: AuthUser = {
    id: account.id,
    access_token: accessToken,
    url: account.url,
  };

  return produce(auth, draft => {
    draft.users[account.url] = authUser;
    maybeShiftMe(draft);
  });
}

function deleteToken(auth: SoapboxAuth, accessToken: string): SoapboxAuth {
  return produce(auth, draft => {
    delete draft.tokens[accessToken];

    for (const url in draft.users) {
      if (draft.users[url].access_token === accessToken) {
        delete draft.users[url];
      }
    }

    maybeShiftMe(draft);
  });
}

function deleteUser(auth: SoapboxAuth, accountUrl: string): SoapboxAuth {
  return produce(auth, draft => {
    const accessToken = draft.users[accountUrl]?.access_token;

    delete draft.tokens[accessToken];
    delete draft.users[accountUrl];

    maybeShiftMe(draft);
  });
}

function deleteForbiddenToken(auth: SoapboxAuth, error: AxiosError, token: string): SoapboxAuth {
  if ([401, 403].includes(error.response?.status!)) {
    return deleteToken(auth, token);
  } else {
    return auth;
  }
}

function reducer(state: SoapboxAuth, action: UnknownAction): SoapboxAuth {
  switch (action.type) {
    case AUTH_APP_CREATED: {
      const result = applicationSchema.safeParse(action.app);
      return result.success ? importApplication(state, result.data) : state;
    }
    case AUTH_APP_AUTHORIZED: {
      const result = tokenSchema.safeParse(action.token);
      if (result.success) {
        return produce(state, draft => {
          if (draft.app) {
            draft.app.access_token = result.data.access_token;
          }
        });
      } else {
        return state;
      }
    }
    case AUTH_LOGGED_IN: {
      const result = tokenSchema.safeParse(action.token);
      return result.success ? importToken(state, result.data) : state;
    }
    case AUTH_LOGGED_OUT: {
      const result = accountSchema.safeParse(action.account);
      return result.success ? deleteUser(state, result.data.url) : state;
    }
    case VERIFY_CREDENTIALS_SUCCESS: {
      const result = accountSchema.safeParse(action.account);
      if (result.success && typeof action.token === 'string') {
        return importCredentials(state, action.token, result.data);
      } else {
        return state;
      }
    }
    case VERIFY_CREDENTIALS_FAIL: {
      if (action.error instanceof AxiosError && typeof action.token === 'string') {
        return deleteForbiddenToken(state, action.error, action.token);
      } else {
        return state;
      }
    }
    case SWITCH_ACCOUNT: {
      const result = accountSchema.safeParse(action.account);
      if (!result.success) {
        return state;
      }
      // Middle-click to switch profiles updates the user in the new tab but leaves the current tab alone.
      if (action.background === true) {
        sessionStorage.setItem(SESSION_KEY, result.data.url);
        return state;
      }
      return { ...state, me: result.data.url };
    }
    case ME_FETCH_SKIP:
      return { ...state, me: undefined };
    default:
      return state;
  }
}

export default function auth(oldState: SoapboxAuth = initialState, action: UnknownAction): SoapboxAuth {
  const state = reducer(oldState, action);

  // Persist the state in localStorage when it changes.
  if (state !== oldState) {
    persistAuth(state);
  }

  // Reload the page when the user logs out or switches accounts.
  if (action.type === AUTH_LOGGED_OUT || (oldState.me && (oldState.me !== state.me))) {
    location.replace('/');
  }

  return state;
}
