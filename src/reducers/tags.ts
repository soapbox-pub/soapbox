import { produce } from 'immer';

import {
  HASHTAG_FETCH_SUCCESS,
  HASHTAG_FOLLOW_REQUEST,
  HASHTAG_FOLLOW_FAIL,
  HASHTAG_UNFOLLOW_REQUEST,
  HASHTAG_UNFOLLOW_FAIL,
} from '@/actions/tags.ts';
import { normalizeTag } from '@/normalizers/index.ts';

import type { Tag } from '@/types/entities.ts';
import type { AnyAction } from 'redux';

type State = Record<string, Tag>;

const initialState: State = {};

const setFollowing = (state: State, name: string, following: boolean): State => {
  if (!state[name]) return state;

  return produce(state, draft => {
    draft[name].following = following;
  });
};

export default function tags(state = initialState, action: AnyAction): State {
  switch (action.type) {
    case HASHTAG_FETCH_SUCCESS:
      return { ...state, [action.name]: normalizeTag(action.tag) };
    case HASHTAG_FOLLOW_REQUEST:
    case HASHTAG_UNFOLLOW_FAIL:
      return setFollowing(state, action.name, true);
    case HASHTAG_FOLLOW_FAIL:
    case HASHTAG_UNFOLLOW_REQUEST:
      return setFollowing(state, action.name, false);
    default:
      return state;
  }
}
