import { useEffect } from 'react';
import z from 'zod';

import { getNextLink, getPrevLink } from 'soapbox/api';
import { useApi, useAppDispatch, useAppSelector, useGetState } from 'soapbox/hooks';
import { filteredArray } from 'soapbox/schemas/utils';

import { entitiesFetchFail, entitiesFetchRequest, entitiesFetchSuccess } from '../actions';

import type { Entity, EntityListState } from '../types';
import type { RootState } from 'soapbox/store';

/** Tells us where to find/store the entity in the cache. */
type EntityPath = [
  /** Name of the entity type for use in the global cache, eg `'Notification'`. */
  entityType: string,
  /**
   * Name of a particular index of this entity type.
   * Multiple params get combined into one string with a `:` separator.
   * You can use empty-string (`''`) if you don't need separate lists.
   */
  ...listKeys: string[],
]

/** Additional options for the hook. */
interface UseEntitiesOpts<TEntity extends Entity> {
  /** A zod schema to parse the API entities. */
  schema?: z.ZodType<TEntity, z.ZodTypeDef, any>
  /**
   * Time (milliseconds) until this query becomes stale and should be refetched.
   * It is 1 minute by default, and can be set to `Infinity` to opt-out of automatic fetching.
   */
  staleTime?: number
  /** A flag to potentially disable sending requests to the API. */
  enabled?: boolean
}

/** A hook for fetching and displaying API entities. */
function useEntities<TEntity extends Entity>(
  /** Tells us where to find/store the entity in the cache. */
  path: EntityPath,
  /** API route to GET, eg `'/api/v1/notifications'`. If undefined, nothing will be fetched. */
  endpoint: string | undefined,
  /** Additional options for the hook. */
  opts: UseEntitiesOpts<TEntity> = {},
) {
  const api = useApi();
  const dispatch = useAppDispatch();
  const getState = useGetState();

  const [entityType, ...listKeys] = path;
  const listKey = listKeys.join(':');

  const entities = useAppSelector(state => selectEntities<TEntity>(state, path));

  const isEnabled = opts.enabled ?? true;
  const isFetching = useListState(path, 'fetching');
  const lastFetchedAt = useListState(path, 'lastFetchedAt');
  const isFetched = useListState(path, 'fetched');
  const isError = !!useListState(path, 'error');

  const next = useListState(path, 'next');
  const prev = useListState(path, 'prev');

  const fetchPage = async(url: string): Promise<void> => {
    // Get `isFetching` state from the store again to prevent race conditions.
    const isFetching = selectListState(getState(), path, 'fetching');
    if (isFetching) return;

    dispatch(entitiesFetchRequest(entityType, listKey));
    try {
      const response = await api.get(url);
      const schema = opts.schema || z.custom<TEntity>();
      const entities = filteredArray(schema).parse(response.data);

      dispatch(entitiesFetchSuccess(entities, entityType, listKey, {
        next: getNextLink(response),
        prev: getPrevLink(response),
        fetching: false,
        fetched: true,
        error: null,
        lastFetchedAt: new Date(),
      }));
    } catch (error) {
      dispatch(entitiesFetchFail(entityType, listKey, error));
    }
  };

  const fetchEntities = async(): Promise<void> => {
    if (endpoint) {
      await fetchPage(endpoint);
    }
  };

  const fetchNextPage = async(): Promise<void> => {
    if (next) {
      await fetchPage(next);
    }
  };

  const fetchPreviousPage = async(): Promise<void> => {
    if (prev) {
      await fetchPage(prev);
    }
  };

  const staleTime = opts.staleTime ?? 60000;

  useEffect(() => {
    if (isEnabled && !isFetching && (!lastFetchedAt || lastFetchedAt.getTime() + staleTime <= Date.now())) {
      fetchEntities();
    }
  }, [endpoint, isEnabled]);

  return {
    entities,
    fetchEntities,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage: !!next,
    hasPreviousPage: !!prev,
    isError,
    isFetched,
    isFetching,
    isLoading: isFetching && entities.length === 0,
  };
}

/** Get cache at path from Redux. */
const selectCache = (state: RootState, path: EntityPath) => state.entities[path[0]];

/** Get list at path from Redux. */
const selectList = (state: RootState, path: EntityPath) => selectCache(state, path)?.lists[path[1]];

/** Select a particular item from a list state. */
function selectListState<K extends keyof EntityListState>(state: RootState, path: EntityPath, key: K) {
  const listState = selectList(state, path)?.state;
  return listState ? listState[key] : undefined;
}

/** Hook to get a particular item from a list state. */
function useListState<K extends keyof EntityListState>(path: EntityPath, key: K) {
  return useAppSelector(state => selectListState(state, path, key));
}

/** Get list of entities from Redux. */
function selectEntities<TEntity extends Entity>(state: RootState, path: EntityPath): readonly TEntity[] {
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

export {
  useEntities,
};