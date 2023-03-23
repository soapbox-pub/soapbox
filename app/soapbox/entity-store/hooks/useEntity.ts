import { useEffect } from 'react';
import z from 'zod';

import { useAppDispatch, useAppSelector } from 'soapbox/hooks';

import { importEntities } from '../actions';

import { useEntityRequest } from './useEntityRequest';

import type { Entity } from '../types';
import type { EntitySchema, EntityPath, EntityRequest } from './types';

/** Additional options for the hook. */
interface UseEntityOpts<TEntity extends Entity> {
  /** A zod schema to parse the API entity. */
  schema?: EntitySchema<TEntity>
  /** Whether to refetch this entity every time the hook mounts, even if it's already in the store. */
  refetch?: boolean
}

function useEntity<TEntity extends Entity>(
  path: EntityPath,
  entityRequest: EntityRequest,
  opts: UseEntityOpts<TEntity> = {},
) {
  const { request, isLoading: isFetching } = useEntityRequest();
  const dispatch = useAppDispatch();

  const [entityType, entityId] = path;

  const defaultSchema = z.custom<TEntity>();
  const schema = opts.schema || defaultSchema;

  const entity = useAppSelector(state => state.entities[entityType]?.store[entityId] as TEntity | undefined);

  const isLoading = isFetching && !entity;

  const fetchEntity = async () => {
    try {
      const response = await request(entityRequest);
      const entity = schema.parse(response.data);
      dispatch(importEntities([entity], entityType));
    } catch (e) {
      // do nothing
    }
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