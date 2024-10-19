import {
  ADMIN_USER_INDEX_EXPAND_FAIL,
  ADMIN_USER_INDEX_EXPAND_REQUEST,
  ADMIN_USER_INDEX_EXPAND_SUCCESS,
  ADMIN_USER_INDEX_FETCH_FAIL,
  ADMIN_USER_INDEX_FETCH_REQUEST,
  ADMIN_USER_INDEX_FETCH_SUCCESS,
  ADMIN_USER_INDEX_QUERY_SET,
} from 'soapbox/actions/admin';

import type { AnyAction } from 'redux';

interface State {
  isLoading: boolean;
  loaded: boolean;
  items: Set<string>;
  filters: Set<string>;
  pageSize: number;
  page: number;
  query: string;
  next: string | null;
}

function createState(): State {
  return {
    isLoading: false,
    loaded: false,
    items: new Set(),
    filters: new Set(['local', 'active']),
    pageSize: 50,
    page: -1,
    query: '',
    next: null,
  };
}

export default function admin_user_index(state: State = createState(), action: AnyAction): State {
  switch (action.type) {
    case ADMIN_USER_INDEX_QUERY_SET:
      return { ...state, query: action.query };
    case ADMIN_USER_INDEX_FETCH_REQUEST:
      return {
        ...state,
        isLoading: true,
        loaded: true,
        items: new Set(),
        page: 0,
        next: null,
      };
    case ADMIN_USER_INDEX_FETCH_SUCCESS:
      return {
        ...state,
        isLoading: false,
        loaded: true,
        items: new Set(action.accounts.map((account: { id: string }) => account.id)),
        page: 1,
        next: action.next,
      };
    case ADMIN_USER_INDEX_FETCH_FAIL:
    case ADMIN_USER_INDEX_EXPAND_FAIL:
      return { ...state, isLoading: false };
    case ADMIN_USER_INDEX_EXPAND_REQUEST:
      return { ...state, isLoading: true };
    case ADMIN_USER_INDEX_EXPAND_SUCCESS:
      return {
        ...state,
        isLoading: false,
        loaded: true,
        items: new Set([...state.items, ...action.accounts.map((account: { id: string }) => account.id)]),
        page: 1,
        next: action.next,
      };
    default:
      return state;
  }
}
