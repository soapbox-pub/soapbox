import { useEffect, useState } from 'react';
import z from 'zod';

import { useApi, useAppDispatch, useAppSelector } from 'soapbox/hooks';

import { importEntities } from '../actions';

import type { Entity } from '../types';
import type { EntitySchema } from './types';

type EntityPath = [entityType: string, entityId: string]

/** Additional options for the hook. */
interface UseEntityOpts<TEntity extends Entity> {
  /** A zod schema to parse the API entity. */
  schema?: EntitySchema<TEntity>
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

  const defaultSchema = z.custom<TEntity>();
  const schema = opts.schema || defaultSchema;

  const entity = useAppSelector(state => state.entities[entityType]?.store[entityId] as TEntity | undefined);

  const [isFetching, setIsFetching] = useState(false);
  const isLoading = isFetching && !entity;

  const fetchEntity = () => {
    setIsFetching(true);
    api.get(endpoint).then(({ data }) => {
      const entity = schema.parse(data);
      dispatch(importEntities([entity], entityType));
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