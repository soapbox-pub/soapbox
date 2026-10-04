import { HISTORY_FETCH_REQUEST, HISTORY_FETCH_SUCCESS, HISTORY_FETCH_FAIL } from '@/actions/history.ts';
import { normalizeStatusEdit, type StatusEdit } from '@/normalizers/index.ts';

import type { AnyAction } from 'redux';

interface StatusHistory {
  loading: boolean;
  items: StatusEdit[];
}

type State = Record<string, StatusHistory>;

const initialState: State = {};

const emptyHistory: StatusHistory = {
  loading: false,
  items: [],
};

export default function history(state: State = initialState, action: AnyAction): State {
  switch (action.type) {
    case HISTORY_FETCH_REQUEST:
      return {
        ...state,
        [action.statusId]: { loading: true, items: [] },
      };
    case HISTORY_FETCH_SUCCESS:
      return {
        ...state,
        [action.statusId]: {
          loading: false,
          items: action.history.map((x: any, i: number) => ({ ...x, account: x.account.id, original: i === 0 })).reverse().map(normalizeStatusEdit),
        },
      };
    case HISTORY_FETCH_FAIL:
      return {
        ...state,
        [action.statusId]: { ...(state[action.statusId] ?? emptyHistory), loading: false },
      };
    default:
      return state;
  }
}
