import {
  MFA_FETCH_SUCCESS,
  MFA_CONFIRM_SUCCESS,
  MFA_DISABLE_SUCCESS,
} from '../actions/mfa.ts';
import {
  FETCH_TOKENS_SUCCESS,
  REVOKE_TOKEN_SUCCESS,
} from '../actions/security.ts';
import { fromDefaults } from '../utils/normalizers.ts';

import type { AnyAction } from 'redux';

export interface Token {
  id: number;
  app_name: string;
  valid_until: string;
}

interface Mfa {
  settings: Record<string, boolean>;
}

interface State {
  tokens: Token[];
  mfa: Mfa;
}

const initialState: State = {
  tokens: [],
  mfa: {
    settings: {
      totp: false,
    },
  },
};

const normalizeToken = (token: Record<string, any>): Token => fromDefaults<Token>({
  id: 0,
  app_name: '',
  valid_until: '',
}, token);

const deleteToken = (state: State, tokenId: number): State => {
  return { ...state, tokens: state.tokens.filter(token => token.id !== tokenId) };
};

const setMfa = (state: State, method: string, enabled: boolean): State => {
  return {
    ...state,
    mfa: {
      ...state.mfa,
      settings: { ...state.mfa.settings, [method]: enabled },
    },
  };
};

export default function security(state: State = initialState, action: AnyAction): State {
  switch (action.type) {
    case FETCH_TOKENS_SUCCESS:
      return { ...state, tokens: action.tokens.map(normalizeToken) };
    case REVOKE_TOKEN_SUCCESS:
      return deleteToken(state, action.id);
    case MFA_FETCH_SUCCESS:
      return { ...state, mfa: action.data };
    case MFA_CONFIRM_SUCCESS:
      return setMfa(state, action.method, true);
    case MFA_DISABLE_SUCCESS:
      return setMfa(state, action.method, false);
    default:
      return state;
  }
}
