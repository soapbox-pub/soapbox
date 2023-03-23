import { useEffect } from 'react';
import z from 'zod';

import { getNextLink, getPrevLink } from 'soapbox/api';
import { useAppDispatch, useAppSelector, useGetState } from 'soapbox/hooks';
import { filteredArray } from 'soapbox/schemas/utils';
import { realNumberSchema } from 'soapbox/utils/numbers';

import { entitiesFetchFail, entitiesFetchRequest, entitiesFetchSuccess, invalidateEntityList } from '../actions';

import { useEntityRequest } from './useEntityRequest';
import { parseEntitiesPath } from './utils';

import type { Entity, EntityListState } from '../types';
import type { EntitiesPath, EntityRequest, EntitySchema, ExpandedEntitiesPath } from './types';
import type { RootState } from 'soapbox/store';

/** Additional options for the hook. */
interface UseEntitiesOpts<TEntity extends Entity> {
  /** A zod schema to parse the API entities. */
  schema?: EntitySchema<TEntity>
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
  expandedPath: ExpandedEntitiesPath,
  /** API route to GET, eg `'/api/v1/notifications'`. If undefined, nothing will be fetched. */
  entityRequest: EntityRequest,
  /** Additional options for the hook. */
  opts: UseEntitiesOpts<TEntity> = {},
) {
  const { request } = useEntityRequest();
  const dispatch = useAppDispatch();
  const getState = useGetState();

  const { entityType, listKey, path } = parseEntitiesPath(expandedPath);
  const entities = useAppSelector(state => selectEntities<TEntity>(state, path));

  const isEnabled = opts.enabled ?? true;
  const isFetching = useListState(path, 'fetching');
  const lastFetchedAt = useListState(path, 'lastFetchedAt');
  const isFetched = useListState(path, 'fetched');
  const isError = !!useListState(path, 'error');
  const totalCount = useListState(path, 'totalCount');
  const isInvalid = useListState(path, 'invalid');

  const next = useListState(path, 'next');
  const prev = useListState(path, 'prev');

  const fetchPage = async(req: EntityRequest, overwrite = false): Promise<void> => {
    // Get `isFetching` state from the store again to prevent race conditions.
    const isFetching = selectListState(getState(), path, 'fetching');
    if (isFetching) return;

    dispatch(entitiesFetchRequest(entityType, listKey));
    try {
      const response = await request(req);
      const schema = opts.schema || z.custom<TEntity>();
      const entities = filteredArray(schema).parse(response.data);
      const parsedCount = realNumberSchema.safeParse(response.headers['x-total-count']);

      dispatch(entitiesFetchSuccess(entities, entityType, listKey, {
        next: getNextLink(response),
        prev: getPrevLink(response),
        totalCount: parsedCount.success ? parsedCount.data : undefined,
        fetching: false,
        fetched: true,
        error: null,
        lastFetchedAt: new Date(),
        invalid: false,
      }, overwrite));
    } catch (error) {
      dispatch(entitiesFetchFail(entityType, listKey, error));
    }
  };

  const fetchEntities = async(): Promise<void> => {
    await fetchPage(entityRequest, true);
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

  const invalidate = () => {
    dispatch(invalidateEntityList(entityType, listKey));
  };

  const staleTime = opts.staleTime ?? 60000;

  useEffect(() => {
    if (!isEnabled) return;
    if (isFetching) return;
    const isUnset = !lastFetchedAt;
    const isStale = lastFetchedAt ? Date.now() >= lastFetchedAt.getTime() + staleTime : false;

    if (isInvalid || isUnset || isStale) {
      fetchEntities();
    }
  }, [entityRequest, isEnabled]);

  return {
    entities,
    fetchEntities,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage: !!next,
    hasPreviousPage: !!prev,
    totalCount,
    isError,
    isFetched,
    isFetching,
    isLoading: isFetching && entities.length === 0,
    invalidate,
    /** The `X-Total-Count` from the API if available, or the length of items in the store. */
    count: typeof totalCount === 'number' ? totalCount : entities.length,
  };
}

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

export {
  useEntities,
};