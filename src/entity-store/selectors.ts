import { useAppSelector } from 'soapbox/hooks';

import type { EntitiesPath } from './hooks/types';
import type { Entity, EntityListState } from './types';
import type { RootState } from 'soapbox/store';

/** Get cache at path from Redux. */
const selectCache = (state: RootState, path: EntitiesPath) => state.entities[path[0]];

/** Get list at path from Redux. */
const selectList = (state: RootState, path: EntitiesPath) => {
  const [, ...listKeys] = path;
  const listKey = listKeys.join(':');

  return selectCache(state, path)?.lists[listKey];
};

/** Select a particular item from a list state. */
function selectListState<K extends keyof EntityListState>(state: RootState, path: EntitiesPath, key: K) {
  const listState = selectList(state, path)?.state;
  return listState ? listState[key] : undefined;
}

/** Hook to get a particular item from a list state. */
function useListState<K extends keyof EntityListState>(path: EntitiesPath, key: K) {
  return useAppSelector(state => selectListState(state, path, key));
}

/** Get a single entity by its ID from the store. */
function selectEntity<TEntity extends Entity>(
  state: RootState,
  entityType: string, id: string,
): TEntity | undefined {
  return state.entities[entityType]?.store[id] as TEntity | undefined;
}

/** Get list of entities from Redux. */
function selectEntities<TEntity extends Entity>(state: RootState, path: EntitiesPath): readonly TEntity[] {
  const cache = selectCache(state, path);
  const list = selectList(state, path);

  const entityIds = list?.ids;

  return entityIds ? (
    Array.from(entityIds).reduce<TEntity[]>((result, id) => {
      const entity = cache?.store[id];
      if (entity) {
        result.push(entity as TEntity);
      }
      return result;
    }, [])
  ) : [];
}

/** Find an entity using a finder function. */
function findEntity<TEntity extends Entity>(
  state: RootState,
  entityType: string,
  lookupFn: (entity: TEntity) => boolean,
) {
  const cache = state.entities[entityType];

  if (cache) {
    return (Object.values(cache.store) as TEntity[]).find(lookupFn);
  }
}

export {
  selectCache,
  selectList,
  selectListState,
  useListState,
  selectEntities,
  selectEntity,
  findEntity,
};