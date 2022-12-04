import produce, { enableMapSet } from 'immer';

import { EntityAction, ENTITIES_IMPORT } from './actions';
import { createCache, createList, updateStore, updateList } from './utils';

import type { Entity, EntityCache } from './types';

enableMapSet();

/** Entity reducer state. */
type State = Map<string, EntityCache>;

/** Import entities into the cache. */
const importEntities = (
  state: Readonly<State>,
  entityType: string,
  entities: Entity[],
  listKey?: string,
): State => {
  return produce(state, draft => {
    const cache = draft.get(entityType) ?? createCache();
    cache.store = updateStore(cache.store, entities);

    if (listKey) {
      const list = cache.lists.get(listKey) ?? createList();
      cache.lists.set(listKey, updateList(list, entities));
    }

    return draft.set(entityType, cache);
  });
};

/** Stores various entity data and lists in a one reducer. */
function reducer(state: Readonly<State> = new Map(), action: EntityAction): State {
  switch (action.type) {
    case ENTITIES_IMPORT:
      return importEntities(state, action.entityType, action.entities, action.listKey);
    default:
      return state;
  }
}

export default reducer;