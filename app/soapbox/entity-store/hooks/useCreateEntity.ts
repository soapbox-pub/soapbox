import { z } from 'zod';

import { useAppDispatch } from 'soapbox/hooks';

import { importEntities } from '../actions';

import { parseEntitiesPath } from './utils';

import type { Entity } from '../types';
import type { EntitySchema, ExpandedEntitiesPath } from './types';

type CreateFn<Params, Result> = (params: Params) => Promise<Result> | Result;

interface UseCreateEntityOpts<TEntity extends Entity = Entity> {
  schema?: EntitySchema<TEntity>
}

type CreateEntityResult<TEntity extends Entity = Entity, Result = unknown, Error = unknown> =
  {
    success: true
    result: Result
    entity: TEntity
  } | {
    success: false
    error: Error
  }

interface EntityCallbacks<TEntity extends Entity = Entity, Error = unknown> {
  onSuccess?(entity: TEntity): void
  onError?(error: Error): void
}

function useCreateEntity<TEntity extends Entity = Entity, Params = any, Result = unknown>(
  expandedPath: ExpandedEntitiesPath,
  createFn: CreateFn<Params, Result>,
  opts: UseCreateEntityOpts<TEntity> = {},
) {
  const path = parseEntitiesPath(expandedPath);
  const [entityType, listKey] = path;

  const dispatch = useAppDispatch();

  return async function createEntity(
    params: Params,
    callbacks: EntityCallbacks = {},
  ): Promise<CreateEntityResult<TEntity>> {
    try {
      const result = await createFn(params);
      const schema = opts.schema || z.custom<TEntity>();
      const entity = schema.parse(result);

      // TODO: optimistic updating
      dispatch(importEntities([entity], entityType, listKey));

      if (callbacks.onSuccess) {
        callbacks.onSuccess(entity);
      }

      return {
        success: true,
        result,
        entity,
      };
    } catch (error) {
      if (callbacks.onError) {
        callbacks.onError(error);
      }

      return {
        success: false,
        error,
      };
    }
  };
}

export { useCreateEntity };