import type { Entity, EntityStore, EntityList, EntityCache, EntityListState, ImportPosition } from './types';

/** Insert the entities into the store. */
const updateStore = (store: EntityStore, entities: Entity[]): EntityStore => {
  return entities.reduce<EntityStore>((store, entity) => {
    store[entity.id] = entity;
    return store;
  }, { ...store });
};

/** Update the list with new entity IDs. */
const updateList = (list: EntityList, entities: Entity[], pos: ImportPosition = 'end'): EntityList => {
  const newIds = entities.map(entity => entity.id);
  const oldIds = Array.from(list.ids);
  const ids = new Set(pos === 'start' ? [...newIds, ...oldIds] : [...oldIds, ...newIds]);

  if (typeof list.state.totalCount === 'number') {
    const sizeDiff = ids.size - list.ids.size;
    list.state.totalCount += sizeDiff;
  }

  return {
    ...list,
    ids,
  };
};

/** Create an empty entity cache. */
const createCache = (): EntityCache => ({
  store: {},
  lists: {},
});

/** Create an empty entity list. */
const createList = (): EntityList => ({
  ids: new Set(),
  state: createListState(),
});

/** Create an empty entity list state. */
const createListState = (): EntityListState => ({
  next: undefined,
  prev: undefined,
  totalCount: 0,
  error: null,
  fetched: false,
  fetching: false,
  lastFetchedAt: undefined,
  invalid: false,
});

export {
  updateStore,
  updateList,
  createCache,
  createList,
  createListState,
};