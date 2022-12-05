import { getNextLink, getPrevLink } from 'soapbox/api';
import { useApi, useAppDispatch, useAppSelector } from 'soapbox/hooks';

import { entitiesFetchFail, entitiesFetchRequest, entitiesFetchSuccess } from '../actions';

import type { Entity } from '../types';

type EntityPath = [entityType: string, listKey: string]

function useEntities<TEntity extends Entity>(path: EntityPath, endpoint: string) {
  const api = useApi();
  const dispatch = useAppDispatch();

  const [entityType, listKey] = path;

  const cache = useAppSelector(state => state.entities[entityType]);
  const list = cache?.lists[listKey];

  const entityIds = list?.ids;

  const entities: readonly TEntity[] = entityIds ? (
    Array.from(entityIds).reduce<TEntity[]>((result, id) => {
      const entity = cache?.store[id] as TEntity | undefined;
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