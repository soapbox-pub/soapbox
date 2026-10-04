import {
  LIST_CREATE_REQUEST,
  LIST_CREATE_FAIL,
  LIST_CREATE_SUCCESS,
  LIST_UPDATE_REQUEST,
  LIST_UPDATE_FAIL,
  LIST_UPDATE_SUCCESS,
  LIST_EDITOR_RESET,
  LIST_EDITOR_SETUP,
  LIST_EDITOR_TITLE_CHANGE,
  LIST_ACCOUNTS_FETCH_REQUEST,
  LIST_ACCOUNTS_FETCH_SUCCESS,
  LIST_ACCOUNTS_FETCH_FAIL,
  LIST_EDITOR_SUGGESTIONS_READY,
  LIST_EDITOR_SUGGESTIONS_CLEAR,
  LIST_EDITOR_SUGGESTIONS_CHANGE,
  LIST_EDITOR_ADD_SUCCESS,
  LIST_EDITOR_REMOVE_SUCCESS,
} from '../actions/lists.ts';

import type { AnyAction } from 'redux';

interface State {
  listId: string | null;
  isSubmitting: boolean;
  isChanged: boolean;
  title: string;
  accounts: {
    items: string[];
    loaded: boolean;
    isLoading: boolean;
  };
  suggestions: {
    value: string;
    items: string[];
  };
}

const initialState: State = {
  listId: null,
  isSubmitting: false,
  isChanged: false,
  title: '',
  accounts: {
    items: [],
    loaded: false,
    isLoading: false,
  },
  suggestions: {
    value: '',
    items: [],
  },
};

export default function listEditorReducer(state: State = initialState, action: AnyAction): State {
  switch (action.type) {
    case LIST_EDITOR_RESET:
      return initialState;
    case LIST_EDITOR_SETUP:
      return {
        ...state,
        listId: action.list.id,
        title: action.list.title,
        isSubmitting: false,
      };
    case LIST_EDITOR_TITLE_CHANGE:
      return { ...state, title: action.value, isChanged: true };
    case LIST_CREATE_REQUEST:
    case LIST_UPDATE_REQUEST:
      return { ...state, isSubmitting: true, isChanged: false };
    case LIST_CREATE_FAIL:
    case LIST_UPDATE_FAIL:
      return { ...state, isSubmitting: false };
    case LIST_CREATE_SUCCESS:
    case LIST_UPDATE_SUCCESS:
      return { ...state, isSubmitting: false, listId: action.list.id };
    case LIST_ACCOUNTS_FETCH_REQUEST:
      return { ...state, accounts: { ...state.accounts, isLoading: true } };
    case LIST_ACCOUNTS_FETCH_FAIL:
      return { ...state, accounts: { ...state.accounts, isLoading: false } };
    case LIST_ACCOUNTS_FETCH_SUCCESS:
      return {
        ...state,
        accounts: {
          isLoading: false,
          loaded: true,
          items: action.accounts.map((item: { id: string }) => item.id),
        },
      };
    case LIST_EDITOR_SUGGESTIONS_CHANGE:
      return { ...state, suggestions: { ...state.suggestions, value: action.value } };
    case LIST_EDITOR_SUGGESTIONS_READY:
      return { ...state, suggestions: { ...state.suggestions, items: action.accounts.map((item: { id: string }) => item.id) } };
    case LIST_EDITOR_SUGGESTIONS_CLEAR:
      return { ...state, suggestions: { items: [], value: '' } };
    case LIST_EDITOR_ADD_SUCCESS:
      return { ...state, accounts: { ...state.accounts, items: [action.accountId, ...state.accounts.items] } };
    case LIST_EDITOR_REMOVE_SUCCESS:
      return { ...state, accounts: { ...state.accounts, items: state.accounts.items.filter(item => item !== action.accountId) } };
    default:
      return state;
  }
}
