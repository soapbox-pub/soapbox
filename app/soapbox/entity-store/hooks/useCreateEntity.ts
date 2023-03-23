import { z } from 'zod';

import { useApi, useAppDispatch } from 'soapbox/hooks';

import { importEntities } from '../actions';

import { parseEntitiesPath, toAxiosRequest } from './utils';

import type { Entity } from '../types';
import type { EntityRequest, EntitySchema, ExpandedEntitiesPath } from './types';

interface UseCreateEntityOpts<TEntity extends Entity = Entity> {
  schema?: EntitySchema<TEntity>
}

interface EntityCallbacks<TEntity extends Entity = Entity, Error = unknown> {
  onSuccess?(entity: TEntity): void
  onError?(error: Error): void
}

function useCreateEntity<TEntity extends Entity = Entity, Data = any>(
  expandedPath: ExpandedEntitiesPath,
  request: EntityRequest,
  opts: UseCreateEntityOpts<TEntity> = {},
) {
  const api = useApi();
  const dispatch = useAppDispatch();

  const { entityType, listKey } = parseEntitiesPath(expandedPath);

  return async function createEntity(
    data: Data,
    callbacks: EntityCallbacks = {},
  ): Promise<void> {
    try {
      const result = await api.request({
        ...toAxiosRequest(request),
        data,
      });

      const schema = opts.schema || z.custom<TEntity>();
      const entity = schema.parse(result.data);

      // TODO: optimistic updating
      dispatch(importEntities([entity], entityType, listKey));

      if (callbacks.onSuccess) {
        callbacks.onSuccess(entity);
      }
    } catch (error) {
      if (callbacks.onError) {
        callbacks.onError(error);
      }
    }
  };
}

export { useCreateEntity };