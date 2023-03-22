import produce, { enableMapSet } from 'immer';

import {
  ENTITIES_IMPORT,
  ENTITIES_DELETE,
  ENTITIES_DISMISS,
  ENTITIES_FETCH_REQUEST,
  ENTITIES_FETCH_SUCCESS,
  ENTITIES_FETCH_FAIL,
  EntityAction,
} from './actions';
import { createCache, createList, updateStore, updateList } from './utils';

import type { DeleteEntitiesOpts } from './actions';
import type { Entity, EntityCache, EntityListState } from './types';

enableMapSet();

/** Entity reducer state. */
interface State {
  [entityType: string]: EntityCache | undefined
}

/** Import entities into the cache. */
const importEntities = (
  state: State,
  entityType: string,
  entities: Entity[],
  listKey?: string,
  newState?: EntityListState,
): State => {
  return produce(state, draft => {
    const cache = draft[entityType] ?? createCache();
    cache.store = updateStore(cache.store, entities);

    if (typeof listKey === 'string') {
      let list = { ...(cache.lists[listKey] ?? createList()) };
      list = updateList(list, entities);
      if (newState) {
        list.state = newState;
      }
      cache.lists[listKey] = list;
    }

    draft[entityType] = cache;
  });
};

const deleteEntities = (
  state: State,
  entityType: string,
  ids: Iterable<string>,
  opts: DeleteEntitiesOpts,
) => {
  return produce(state, draft => {
    const cache = draft[entityType] ?? createCache();

    for (const id of ids) {
      delete cache.store[id];

      if (!opts?.preserveLists) {
        for (const list of Object.values(cache.lists)) {
          if (list) {
            list.ids.delete(id);
            list.state.totalCount--;
          }
        }
      }
    }

    draft[entityType] = cache;
  });
};

const dismissEntities = (
  state: State,
  entityType: string,
  ids: Iterable<string>,
  listKey: string,
) => {
  return produce(state, draft => {
    const cache = draft[entityType] ?? createCache();
    const list = cache.lists[listKey];

    if (list) {
      for (const id of ids) {
        list.ids.delete(id);
        list.state.totalCount--;
      }

      draft[entityType] = cache;
    }
  });
};

const setFetching = (
  state: State,
  entityType: string,
  listKey: string | undefined,
  isFetching: boolean,
  error?: any,
) => {
  return produce(state, draft => {
    const cache = draft[entityType] ?? createCache();

    if (typeof listKey === 'string') {
      const list = cache.lists[listKey] ?? createList();
      list.state.fetching = isFetching;
      list.state.error = error;
      cache.lists[listKey] = list;
    }

    draft[entityType] = cache;
  });
};

/** Stores various entity data and lists in a one reducer. */
function reducer(state: Readonly<State> = {}, action: EntityAction): State {
  switch (action.type) {
    case ENTITIES_IMPORT:
      return importEntities(state, action.entityType, action.entities, action.listKey);
    case ENTITIES_DELETE:
      return deleteEntities(state, action.entityType, action.ids, action.opts);
    case ENTITIES_DISMISS:
      return dismissEntities(state, action.entityType, action.ids, action.listKey);
    case ENTITIES_FETCH_SUCCESS:
      return importEntities(state, action.entityType, action.entities, action.listKey, action.newState);
    case ENTITIES_FETCH_REQUEST:
      return setFetching(state, action.entityType, action.listKey, true);
    case ENTITIES_FETCH_FAIL:
      return setFetching(state, action.entityType, action.listKey, false, action.error);
    default:
      return state;
  }
}

export default reducer;
export type { State };