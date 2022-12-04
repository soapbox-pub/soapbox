import produce, { enableMapSet } from 'immer';

import {
  ENTITIES_IMPORT,
  ENTITIES_FETCH_REQUEST,
  ENTITIES_FETCH_SUCCESS,
  ENTITIES_FETCH_FAIL,
  EntityAction,
} from './actions';
import { createCache, createList, updateStore, updateList } from './utils';

import type { Entity, EntityCache, EntityListState } from './types';

enableMapSet();

/** Entity reducer state. */
type State = Map<string, EntityCache>;

/** Import entities into the cache. */
const importEntities = (
  state: Readonly<State>,
  entityType: string,
  entities: Entity[],
  listKey?: string,
  newState?: EntityListState,
): State => {
  return produce(state, draft => {
    const cache = draft.get(entityType) ?? createCache();
    cache.store = updateStore(cache.store, entities);

    if (listKey) {
      let list = cache.lists.get(listKey) ?? createList();
      list = updateList(list, entities);
      if (newState) {
        list.state = newState;
      }
      cache.lists.set(listKey, list);
    }

    return draft.set(entityType, cache);
  });
};

const setFetching = (
  state: State,
  entityType: string,
  listKey: string | undefined,
  isFetching: boolean,
) => {
  return produce(state, draft => {
    const cache = draft.get(entityType) ?? createCache();

    if (listKey) {
      const list = cache.lists.get(listKey) ?? createList();
      list.state.fetching = isFetching;
      cache.lists.set(listKey, list);
    }

    return draft.set(entityType, cache);
  });
};

/** Stores various entity data and lists in a one reducer. */
function reducer(state: Readonly<State> = new Map(), action: EntityAction): State {
  switch (action.type) {
    case ENTITIES_IMPORT:
      return importEntities(state, action.entityType, action.entities, action.listKey);
    case ENTITIES_FETCH_SUCCESS:
      return importEntities(state, action.entityType, action.entities, action.listKey, action.newState);
    case ENTITIES_FETCH_REQUEST:
      return setFetching(state, action.entityType, action.listKey, true);
    case ENTITIES_FETCH_FAIL:
      return setFetching(state, action.entityType, action.listKey, false);
    default:
      return state;
  }
}

export default reducer;