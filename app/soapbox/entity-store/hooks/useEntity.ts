import { useState } from 'react';

import { useApi, useAppDispatch, useAppSelector } from 'soapbox/hooks';

import { importEntities } from '../actions';

import type { Entity } from '../types';

type EntityPath = [entityType: string, entityId: string]

function useEntity<TEntity extends Entity>(path: EntityPath, endpoint: string) {
  const api = useApi();
  const dispatch = useAppDispatch();

  const [entityType, entityId] = path;
  const entity = useAppSelector(state => state.entities.get(entityType)?.store.get(entityId)) as TEntity | undefined;

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