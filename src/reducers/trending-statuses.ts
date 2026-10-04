import {
  TRENDING_STATUSES_FETCH_REQUEST,
  TRENDING_STATUSES_FETCH_SUCCESS,
  TRENDING_STATUSES_EXPAND_SUCCESS,
} from '@/actions/trending-statuses.ts';

import type { APIEntity } from '@/types/entities.ts';
import type { AnyAction } from 'redux';

interface State {
  items: string[];
  isLoading: boolean;
  next: string | null;
}

const initialState: State = {
  items: [],
  isLoading: false,
  next: null,
};

type APIEntities = Array<APIEntity>;

const toIds = (items: APIEntities): string[] => items.map(item => item.id);

const importStatuses = (state: State, statuses: APIEntities, next: string | null): State => {
  return {
    ...state,
    items: [...new Set([...state.items, ...toIds(statuses)])],
    isLoading: false,
    next: next ? next : null,
  };
};

export default function trending_statuses(state: State = initialState, action: AnyAction): State {
  switch (action.type) {
    case TRENDING_STATUSES_FETCH_REQUEST:
      return { ...state, isLoading: true };
    case TRENDING_STATUSES_EXPAND_SUCCESS:
    case TRENDING_STATUSES_FETCH_SUCCESS:
      return importStatuses(state, action.statuses, action.next);
    default:
      return state;
  }
}
