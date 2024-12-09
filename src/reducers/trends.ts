import { Record as ImmutableRecord } from 'immutable';

import { normalizeTag } from 'soapbox/normalizers/index.ts';

import {
  TRENDS_FETCH_REQUEST,
  TRENDS_FETCH_SUCCESS,
  TRENDS_FETCH_FAIL,
} from '../actions/trends.ts';

import type { AnyAction } from 'redux';
import type { APIEntity, Tag } from 'soapbox/types/entities.ts';

const ReducerRecord = ImmutableRecord({
  items: [] as Tag[],
  isLoading: false,
});

type State = ReturnType<typeof ReducerRecord>;

export default function trendsReducer(state: State = ReducerRecord(), action: AnyAction) {
  switch (action.type) {
    case TRENDS_FETCH_REQUEST:
      return state.set('isLoading', true);
    case TRENDS_FETCH_SUCCESS:
      return {
        ...state,
        items: action.tags.map((item: APIEntity) => normalizeTag(item)),
        isLoading: false,
      };
    case TRENDS_FETCH_FAIL:
      return state.set('isLoading', false);
    default:
      return state;
  }
}
