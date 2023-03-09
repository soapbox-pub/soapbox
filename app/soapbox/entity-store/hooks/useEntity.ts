import { useEffect, useState } from 'react';

import { useApi, useAppDispatch, useAppSelector } from 'soapbox/hooks';

import { importEntities } from '../actions';

import type { Entity } from '../types';

type EntityPath = [entityType: string, entityId: string]

/** Additional options for the hook. */
interface UseEntityOpts<TEntity> {
  /** A parser function that returns the desired type, or undefined if validation fails. */
  parser?: (entity: unknown) => TEntity | undefined
  /** Whether to refetch this entity every time the hook mounts, even if it's already in the store. */
  refetch?: boolean
}

function useEntity<TEntity extends Entity>(
  path: EntityPath,
  endpoint: string,
  opts: UseEntityOpts<TEntity> = {},
) {
  const api = useApi();
  const dispatch = useAppDispatch();

  const [entityType, entityId] = path;

  const defaultParser = (entity: unknown) => entity as TEntity;
  const parseEntity = opts.parser || defaultParser;

  const entity = useAppSelector(state => parseEntity(state.entities[entityType]?.store[entityId]));

  const [isFetching, setIsFetching] = useState(false);
  const isLoading = isFetching && !entity;

  const fetchEntity = () => {
    setIsFetching(true);
    api.get(endpoint).then(({ data }) => {
      dispatch(importEntities([data], entityType));
      setIsFetching(false);
    }).catch(() => {
      setIsFetching(false);
    });
  };

  useEffect(() => {
    if (!entity || opts.refetch) {
      fetchEntity();
    }
  }, []);

  return {
    entity,
    fetchEntity,
    isFetching,
    isLoading,
  };
}

export {
  useEntity,
};