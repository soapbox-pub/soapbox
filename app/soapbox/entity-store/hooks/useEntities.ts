import { getNextLink, getPrevLink } from 'soapbox/api';
import { useApi, useAppDispatch, useAppSelector } from 'soapbox/hooks';

import { entitiesFetchFail, entitiesFetchRequest, entitiesFetchSuccess } from '../actions';

import type { Entity } from '../types';

/** Tells us where to find/store the entity in the cache. */
type EntityPath = [
  /** Name of the entity type for use in the global cache, eg `'Notification'`. */
  entityType: string,
  /** Name of a particular index of this entity type. You can use empty-string (`''`) if you don't need separate lists. */
  listKey: string,
]

/** Additional options for the hook. */
interface UseEntitiesOpts<TEntity> {
  /** A parser function that returns the desired type, or undefined if validation fails. */
  parser?: (entity: unknown) => TEntity | undefined
}

/** A hook for fetching and displaying API entities. */
function useEntities<TEntity extends Entity>(
  /** Tells us where to find/store the entity in the cache. */
  path: EntityPath,
  /** API route to GET, eg `'/api/v1/notifications'` */
  endpoint: string,
  /** Additional options for the hook. */
  opts: UseEntitiesOpts<TEntity> = {},
) {
  const api = useApi();
  const dispatch = useAppDispatch();

  const [entityType, listKey] = path;

  const defaultParser = (entity: unknown) => entity as TEntity;
  const parseEntity = opts.parser || defaultParser;

  const cache = useAppSelector(state => state.entities[entityType]);
  const list = cache?.lists[listKey];

  const entityIds = list?.ids;

  const entities: readonly TEntity[] = entityIds ? (
    Array.from(entityIds).reduce<TEntity[]>((result, id) => {
      const entity = parseEntity(cache?.store[id] as unknown);
      if (entity) {
        result.push(entity);
      }
      return result;
    }, [])
  ) : [];

  const isFetching = Boolean(list?.state.fetching);
  const isLoading = isFetching && entities.length === 0;
  const hasNextPage = Boolean(list?.state.next);
  const hasPreviousPage = Boolean(list?.state.prev);

  const fetchPage = async(url: string): Promise<void> => {
    dispatch(entitiesFetchRequest(entityType, listKey));
    try {
      const response = await api.get(url);
      dispatch(entitiesFetchSuccess(response.data, entityType, listKey, {
        next: getNextLink(response),
        prev: getPrevLink(response),
        fetching: false,
        error: null,
      }));
    } catch (error) {
      dispatch(entitiesFetchFail(entityType, listKey, error));
    }
  };

  const fetchEntities = async(): Promise<void> => {
    await fetchPage(endpoint);
  };

  const fetchNextPage = async(): Promise<void> => {
    const next = list?.state.next;

    if (next) {
      await fetchPage(next);
    }
  };

  const fetchPreviousPage = async(): Promise<void> => {
    const prev = list?.state.prev;

    if (prev) {
      await fetchPage(prev);
    }
  };

  return {
    entities,
    fetchEntities,
    isFetching,
    isLoading,
    hasNextPage,
    hasPreviousPage,
    fetchNextPage,
    fetchPreviousPage,
  };
}

export {
  useEntities,
};