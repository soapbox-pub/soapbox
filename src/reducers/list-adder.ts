import {
  LIST_ADDER_RESET,
  LIST_ADDER_SETUP,
  LIST_ADDER_LISTS_FETCH_REQUEST,
  LIST_ADDER_LISTS_FETCH_SUCCESS,
  LIST_ADDER_LISTS_FETCH_FAIL,
  LIST_EDITOR_ADD_SUCCESS,
  LIST_EDITOR_REMOVE_SUCCESS,
} from '../actions/lists.ts';

import type { AnyAction } from 'redux';

interface State {
  accountId: string | null;
  lists: {
    items: string[];
    loaded: boolean;
    isLoading: boolean;
  };
}

const initialState: State = {
  accountId: null,
  lists: {
    items: [],
    loaded: false,
    isLoading: false,
  },
};

export default function listAdderReducer(state: State = initialState, action: AnyAction): State {
  switch (action.type) {
    case LIST_ADDER_RESET:
      return initialState;
    case LIST_ADDER_SETUP:
      return { ...state, accountId: action.account.id };
    case LIST_ADDER_LISTS_FETCH_REQUEST:
      return { ...state, lists: { ...state.lists, isLoading: true } };
    case LIST_ADDER_LISTS_FETCH_FAIL:
      return { ...state, lists: { ...state.lists, isLoading: false } };
    case LIST_ADDER_LISTS_FETCH_SUCCESS:
      return {
        ...state,
        lists: {
          isLoading: false,
          loaded: true,
          items: action.lists.map((item: { id: string }) => item.id),
        },
      };
    case LIST_EDITOR_ADD_SUCCESS:
      return { ...state, lists: { ...state.lists, items: [action.listId, ...state.lists.items] } };
    case LIST_EDITOR_REMOVE_SUCCESS:
      return { ...state, lists: { ...state.lists, items: state.lists.items.filter(item => item !== action.listId) } };
    default:
      return state;
  }
}
