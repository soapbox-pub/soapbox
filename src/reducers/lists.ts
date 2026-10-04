import {
  LIST_FETCH_SUCCESS,
  LIST_FETCH_FAIL,
  LISTS_FETCH_SUCCESS,
  LIST_CREATE_SUCCESS,
  LIST_UPDATE_SUCCESS,
  LIST_DELETE_SUCCESS,
} from '@/actions/lists.ts';
import { normalizeList, type List } from '@/normalizers/index.ts';

import type { APIEntity } from '@/types/entities.ts';
import type { AnyAction } from 'redux';

type APIEntities = Array<APIEntity>;

type State = Record<string, List | false>;

const initialState: State = {};

const importLists = (state: State, lists: APIEntities): State => {
  const result = { ...state };

  lists.forEach(list => {
    result[list.id] = normalizeList(list);
  });

  return result;
};

export default function lists(state: State = initialState, action: AnyAction): State {
  switch (action.type) {
    case LIST_FETCH_SUCCESS:
    case LIST_CREATE_SUCCESS:
    case LIST_UPDATE_SUCCESS:
      return importLists(state, [action.list]);
    case LISTS_FETCH_SUCCESS:
      return importLists(state, action.lists);
    case LIST_DELETE_SUCCESS:
    case LIST_FETCH_FAIL:
      return { ...state, [action.id]: false };
    default:
      return state;
  }
}
