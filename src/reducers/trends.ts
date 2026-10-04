import { normalizeTag } from '@/normalizers/index.ts';

import {
  TRENDS_FETCH_REQUEST,
  TRENDS_FETCH_SUCCESS,
  TRENDS_FETCH_FAIL,
} from '../actions/trends.ts';

import type { APIEntity, Tag } from '@/types/entities.ts';
import type { AnyAction } from 'redux';

interface State {
  items: Tag[];
  isLoading: boolean;
}

const initialState: State = {
  items: [],
  isLoading: false,
};

export default function trendsReducer(state: State = initialState, action: AnyAction): State {
  switch (action.type) {
    case TRENDS_FETCH_REQUEST:
      return { ...state, isLoading: true };
    case TRENDS_FETCH_SUCCESS:
      return {
        ...state,
        items: action.tags.map((item: APIEntity) => normalizeTag(item)),
        isLoading: false,
      };
    case TRENDS_FETCH_FAIL:
      return { ...state, isLoading: false };
    default:
      return state;
  }
}
