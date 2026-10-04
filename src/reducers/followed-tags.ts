import {
  FOLLOWED_HASHTAGS_FETCH_REQUEST,
  FOLLOWED_HASHTAGS_FETCH_SUCCESS,
  FOLLOWED_HASHTAGS_FETCH_FAIL,
  FOLLOWED_HASHTAGS_EXPAND_REQUEST,
  FOLLOWED_HASHTAGS_EXPAND_SUCCESS,
  FOLLOWED_HASHTAGS_EXPAND_FAIL,
} from '@/actions/tags.ts';
import { normalizeTag } from '@/normalizers/index.ts';

import type { APIEntity, Tag } from '@/types/entities.ts';
import type { AnyAction } from 'redux';

interface State {
  items: Tag[];
  isLoading: boolean;
  next: string | null;
}

const initialState: State = {
  items: [],
  isLoading: false,
  next: null,
};

export default function followed_tags(state: State = initialState, action: AnyAction): State {
  switch (action.type) {
    case FOLLOWED_HASHTAGS_FETCH_REQUEST:
      return { ...state, isLoading: true };
    case FOLLOWED_HASHTAGS_FETCH_SUCCESS:
      return {
        ...state,
        items: action.followed_tags.map((item: APIEntity) => normalizeTag(item)),
        isLoading: false,
        next: action.next,
      };
    case FOLLOWED_HASHTAGS_FETCH_FAIL:
      return { ...state, isLoading: false };
    case FOLLOWED_HASHTAGS_EXPAND_REQUEST:
      return { ...state, isLoading: true };
    case FOLLOWED_HASHTAGS_EXPAND_SUCCESS:
      return {
        ...state,
        items: [...state.items, ...action.followed_tags.map((item: APIEntity) => normalizeTag(item))],
        isLoading: false,
        next: action.next,
      };
    case FOLLOWED_HASHTAGS_EXPAND_FAIL:
      return { ...state, isLoading: false };
    default:
      return state;
  }
}
