import { List as ImmutableList, Record as ImmutableRecord } from 'immutable';

import {
  FOLLOWED_HASHTAGS_FETCH_REQUEST,
  FOLLOWED_HASHTAGS_FETCH_SUCCESS,
  FOLLOWED_HASHTAGS_FETCH_FAIL,
  FOLLOWED_HASHTAGS_EXPAND_REQUEST,
  FOLLOWED_HASHTAGS_EXPAND_SUCCESS,
  FOLLOWED_HASHTAGS_EXPAND_FAIL,
} from 'soapbox/actions/tags';
import { normalizeTag } from 'soapbox/normalizers';

import type { AnyAction } from 'redux';
import type { APIEntity, Tag } from 'soapbox/types/entities';

const ReducerRecord = ImmutableRecord({
  items: ImmutableList<Tag>(),
  isLoading: false,
  next: null,
});

export default function followed_tags(state = ReducerRecord(), action: AnyAction) {
  switch (action.type) {
    case FOLLOWED_HASHTAGS_FETCH_REQUEST:
      return state.set('isLoading', true);
    case FOLLOWED_HASHTAGS_FETCH_SUCCESS:
      return state.withMutations(map => {
        map.set('items', ImmutableList(action.followed_tags.map((item: APIEntity) => normalizeTag(item))));
        map.set('isLoading', false);
        map.set('next', action.next);
      });
    case FOLLOWED_HASHTAGS_FETCH_FAIL:
      return state.set('isLoading', false);
    case FOLLOWED_HASHTAGS_EXPAND_REQUEST:
      return state.set('isLoading', true);
    case FOLLOWED_HASHTAGS_EXPAND_SUCCESS:
      return state.withMutations(map => {
        map.update('items', list => list.concat(action.followed_tags.map((item: APIEntity) => normalizeTag(item))));
        map.set('isLoading', false);
        map.set('next', action.next);
      });
    case FOLLOWED_HASHTAGS_EXPAND_FAIL:
      return state.set('isLoading', false);
    default:
      return state;
  }
}
