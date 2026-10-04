import { ACCOUNT_BLOCK_SUCCESS, ACCOUNT_MUTE_SUCCESS } from '@/actions/accounts.ts';
import { DOMAIN_BLOCK_SUCCESS } from '@/actions/domain-blocks.ts';
import {
  SUGGESTIONS_FETCH_REQUEST,
  SUGGESTIONS_FETCH_SUCCESS,
  SUGGESTIONS_FETCH_FAIL,
  SUGGESTIONS_DISMISS,
  SUGGESTIONS_V2_FETCH_REQUEST,
  SUGGESTIONS_V2_FETCH_SUCCESS,
  SUGGESTIONS_V2_FETCH_FAIL,
} from '@/actions/suggestions.ts';

import type { APIEntity } from '@/types/entities.ts';
import type { AnyAction } from 'redux';

interface Suggestion {
  source: string;
  account: string;
}

interface State {
  items: Suggestion[];
  next: string | null;
  isLoading: boolean;
}

const initialState: State = {
  items: [],
  next: null,
  isLoading: false,
};

type APIEntities = Array<APIEntity>;

const toSuggestion = ({ source, account }: Record<string, any>): Suggestion => ({
  source: source ?? '',
  account: account ?? '',
});

// Convert a v1 account into a v2 suggestion
const accountToSuggestion = (account: APIEntity) => {
  return {
    source: 'past_interactions',
    account: account.id,
  };
};

const importAccounts = (state: State, accounts: APIEntities): State => {
  return {
    ...state,
    items: accounts.map(accountToSuggestion).map(toSuggestion),
    isLoading: false,
  };
};

const importSuggestions = (state: State, suggestions: APIEntities, next: string | null): State => {
  const items = [...state.items];

  suggestions.map(x => ({ ...x, account: x.account.id })).map(toSuggestion).forEach(suggestion => {
    if (!items.some(item => item.account === suggestion.account && item.source === suggestion.source)) {
      items.push(suggestion);
    }
  });

  return {
    ...state,
    items,
    isLoading: false,
    next,
  };
};

const dismissAccounts = (state: State, accountIds: string[]): State => {
  return { ...state, items: state.items.filter(item => !accountIds.includes(item.account)) };
};

export default function suggestionsReducer(state: State = initialState, action: AnyAction): State {
  switch (action.type) {
    case SUGGESTIONS_FETCH_REQUEST:
    case SUGGESTIONS_V2_FETCH_REQUEST:
      return { ...state, isLoading: true };
    case SUGGESTIONS_FETCH_SUCCESS:
      return importAccounts(state, action.accounts);
    case SUGGESTIONS_V2_FETCH_SUCCESS:
      return importSuggestions(state, action.suggestions, action.next);
    case SUGGESTIONS_FETCH_FAIL:
    case SUGGESTIONS_V2_FETCH_FAIL:
      return { ...state, isLoading: false };
    case SUGGESTIONS_DISMISS:
      return dismissAccounts(state, [action.id]);
    case ACCOUNT_BLOCK_SUCCESS:
    case ACCOUNT_MUTE_SUCCESS:
      return dismissAccounts(state, [action.relationship.id]);
    case DOMAIN_BLOCK_SUCCESS:
      return dismissAccounts(state, action.accounts);
    default:
      return state;
  }
}
