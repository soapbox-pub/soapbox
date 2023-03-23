import { useState } from 'react';
import { z } from 'zod';

import { useApi, useAppDispatch } from 'soapbox/hooks';

import { importEntities } from '../actions';

import { parseEntitiesPath, toAxiosRequest } from './utils';

import type { Entity } from '../types';
import type { EntityCallbacks, EntityRequest, EntitySchema, ExpandedEntitiesPath } from './types';

interface UseCreateEntityOpts<TEntity extends Entity = Entity> {
  schema?: EntitySchema<TEntity>
}

function useCreateEntity<TEntity extends Entity = Entity, Data = any>(
  expandedPath: ExpandedEntitiesPath,
  request: EntityRequest,
  opts: UseCreateEntityOpts<TEntity> = {},
) {
  const api = useApi();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { entityType, listKey } = parseEntitiesPath(expandedPath);

  async function createEntity(data: Data, callbacks: EntityCallbacks<TEntity> = {}): Promise<void> {
    setIsLoading(true);

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

    setIsLoading(false);
  }

  return {
    createEntity,
    isLoading,
  };
}

export { useCreateEntity };