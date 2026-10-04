import {
  PATRON_INSTANCE_FETCH_SUCCESS,
  PATRON_ACCOUNT_FETCH_SUCCESS,
} from '../actions/patron.ts';
import { fromDefaults } from '../utils/normalizers.ts';

import type { AnyAction } from 'redux';

export interface PatronAccount {
  is_patron: boolean;
  url: string;
}

export interface PatronInstance {
  funding: {
    amount?: number;
    patrons?: number;
    currency?: string;
    interval?: string;
  };
  goals: {
    amount: number;
    currency?: string;
    interval?: string;
    text: string;
  }[];
  url: string;
}

interface State {
  instance: PatronInstance;
  accounts: Record<string, PatronAccount>;
}

const initialState: State = {
  instance: {
    funding: {},
    goals: [],
    url: '',
  },
  accounts: {},
};

const normalizePatronAccount = (state: State, account: Record<string, any>): State => {
  const normalized = fromDefaults<PatronAccount>({
    is_patron: false,
    url: '',
  }, account);

  return {
    ...state,
    accounts: { ...state.accounts, [normalized.url]: normalized },
  };
};

export default function patron(state: State = initialState, action: AnyAction): State {
  switch (action.type) {
    case PATRON_INSTANCE_FETCH_SUCCESS:
      return { ...state, instance: fromDefaults(initialState.instance, action.instance) };
    case PATRON_ACCOUNT_FETCH_SUCCESS:
      return normalizePatronAccount(state, action.account);
    default:
      return state;
  }
}
