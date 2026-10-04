import {
  ALIASES_SUGGESTIONS_READY,
  ALIASES_SUGGESTIONS_CLEAR,
  ALIASES_SUGGESTIONS_CHANGE,
  ALIASES_FETCH_SUCCESS,
} from '../actions/aliases.ts';

import type { APIEntity } from '@/types/entities.ts';
import type { AnyAction } from 'redux';

interface State {
  aliases: {
    items: string[];
    loaded: boolean;
  };
  suggestions: {
    items: string[];
    value: string;
    loaded: boolean;
  };
}

const initialState: State = {
  aliases: {
    items: [],
    loaded: false,
  },
  suggestions: {
    items: [],
    value: '',
    loaded: false,
  },
};

export default function aliasesReducer(state: State = initialState, action: AnyAction): State {
  switch (action.type) {
    case ALIASES_FETCH_SUCCESS:
      return { ...state, aliases: { ...state.aliases, items: action.value } };
    case ALIASES_SUGGESTIONS_CHANGE:
      return { ...state, suggestions: { ...state.suggestions, value: action.value, loaded: false } };
    case ALIASES_SUGGESTIONS_READY:
      return {
        ...state,
        suggestions: {
          ...state.suggestions,
          items: action.accounts.map((item: APIEntity) => item.id),
          loaded: true,
        },
      };
    case ALIASES_SUGGESTIONS_CLEAR:
      return { ...state, suggestions: { items: [], value: '', loaded: false } };
    default:
      return state;
  }
}
