import { tagSchema, type Tag } from 'soapbox/schemas/index.ts';

import {
  TRENDS_FETCH_REQUEST,
  TRENDS_FETCH_SUCCESS,
  TRENDS_FETCH_FAIL,
} from '../actions/trends.ts';

import type { AnyAction } from 'redux';
import type { APIEntity } from 'soapbox/types/entities.ts';

interface State {
  items: Tag[];
  isLoading: boolean;
}

const ReducerRecord: State = {
  items: [] as Tag[],
  isLoading: false,
};

interface TrendsFetchSuccessAction extends AnyAction {
  type: typeof TRENDS_FETCH_SUCCESS;
  tags: APIEntity[];
}

export default function trendsReducer(state: State = ReducerRecord, action: AnyAction) {
  switch (action.type) {
    case TRENDS_FETCH_REQUEST:
      return { ...state, isLoading: true };
    case TRENDS_FETCH_SUCCESS:
    {
      const typedAction = action as TrendsFetchSuccessAction;
      return { ...state, items: typedAction.tags.map((item: APIEntity) => tagSchema.parse(item)), isLoading: false };
    }
    case TRENDS_FETCH_FAIL:
      return { ...state, isLoading: false };
    default:
      return state;
  }
}
