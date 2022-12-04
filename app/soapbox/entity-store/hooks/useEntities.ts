import { useApi, useAppDispatch, useAppSelector } from 'soapbox/hooks';

import { importEntities } from '../actions';

import type { Entity } from '../types';

type EntityPath = [entityType: string, listKey: string]

function useEntities<TEntity extends Entity>(path: EntityPath, url: string) {
  const api = useApi();
  const dispatch = useAppDispatch();

  const [entityType, listKey] = path;

  const cache = useAppSelector(state => state.entities.get(entityType));
  const list = cache?.lists.get(listKey);

  const entityIds = list?.ids;

  const entities: readonly TEntity[] = entityIds ? (
    Array.from(entityIds).reduce<TEntity[]>((result, id) => {
      const entity = cache?.store.get(id) as TEntity | undefined;
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

  const fetchEntities = async() => {
    const { data } = await api.get(url);
    dispatch(importEntities(data, entityType, listKey));
  };

  const fetchNextPage = async() => {
    const next = list?.state.next;

    if (next) {
      const { data } = await api.get(next);
      dispatch(importEntities(data, entityType, listKey));
    }
  };

  const fetchPreviousPage = async() => {
    const prev = list?.state.prev;

    if (prev) {
      const { data } = await api.get(prev);
      dispatch(importEntities(data, entityType, listKey));
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