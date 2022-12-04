import type { Entity, EntityStore, EntityList, EntityCache } from './types';

/** Insert the entities into the store. */
const updateStore = (store: EntityStore, entities: Entity[]): EntityStore => {
  return entities.reduce<EntityStore>((store, entity) => {
    return store.set(entity.id, entity);
  }, new Map(store));
};

/** Update the list with new entity IDs. */
const updateList = (list: EntityList, entities: Entity[]): EntityList => {
  const newIds = entities.map(entity => entity.id);
  return {
    ...list,
    ids: new Set([...Array.from(list.ids), ...newIds]),
  };
};

/** Create an empty entity cache. */
const createCache = (): EntityCache => ({
  store: new Map(),
  lists: new Map(),
});

/** Create an empty entity list. */
const createList = (): EntityList => ({
  ids: new Set(),
  state: {
    next: undefined,
    prev: undefined,
    fetching: false,
    error: null,
  },
});

export {
  updateStore,
  updateList,
  createCache,
  createList,
};