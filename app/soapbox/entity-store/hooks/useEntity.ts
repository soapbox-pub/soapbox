import { AxiosError } from 'axios';
import { useEffect, useState } from 'react';
import z from 'zod';

import { useAppDispatch, useAppSelector, useLoading } from 'soapbox/hooks';

import { importEntities } from '../actions';

import type { Entity } from '../types';
import type { EntitySchema, EntityPath, EntityFn } from './types';

/** Additional options for the hook. */
interface UseEntityOpts<TEntity extends Entity> {
  /** A zod schema to parse the API entity. */
  schema?: EntitySchema<TEntity>
  /** Whether to refetch this entity every time the hook mounts, even if it's already in the store. */
  refetch?: boolean
  /** A flag to potentially disable sending requests to the API. */
  enabled?: boolean
}

function useEntity<TEntity extends Entity>(
  path: EntityPath,
  entityFn: EntityFn<void>,
  opts: UseEntityOpts<TEntity> = {},
) {
  const [isFetching, setPromise] = useLoading(true);
  const [error, setError] = useState<unknown>();

  const dispatch = useAppDispatch();

  const [entityType, entityId] = path;

  const defaultSchema = z.custom<TEntity>();
  const schema = opts.schema || defaultSchema;

  const entity = useAppSelector(state => state.entities[entityType]?.store[entityId] as TEntity | undefined);

  const isEnabled = opts.enabled ?? true;
  const isLoading = isFetching && !entity;
  const isLoaded = !isFetching && !!entity;

  const fetchEntity = async () => {
    try {
      const response = await setPromise(entityFn());
      const entity = schema.parse(response.data);
      dispatch(importEntities([entity], entityType));
    } catch (e) {
      setError(e);
    }
  };

  useEffect(() => {
    if (!isEnabled) return;
    if (!entity || opts.refetch) {
      fetchEntity();
    }
  }, [isEnabled]);

  return {
    entity,
    fetchEntity,
    isFetching,
    isLoading,
    isLoaded,
    error,
    isUnauthorized: error instanceof AxiosError && error.response?.status === 401,
    isForbidden: error instanceof AxiosError && error.response?.status === 403,
  };
}

export {
  useEntity,
  type UseEntityOpts,
};