import { z } from 'zod';

import { useApi, useAppDispatch } from 'soapbox/hooks';

import { importEntities } from '../actions';

import { useDeleteEntity } from './useDeleteEntity';

import type { Entity } from '../types';
import type { EntitySchema } from './types';
import type { AxiosResponse } from 'axios';

type EntityPath = [entityType: string, listKey?: string]

interface UseEntityActionsOpts<TEntity extends Entity = Entity> {
  schema?: EntitySchema<TEntity>
}

interface CreateEntityResult<TEntity extends Entity = Entity> {
  response: AxiosResponse
  entity: TEntity
}

interface EntityActionEndpoints {
  post?: string
  delete?: string
}

interface EntityCallbacks<TEntity extends Entity = Entity> {
  onSuccess?(entity: TEntity): void
}

function useEntityActions<TEntity extends Entity = Entity, P = any>(
  path: EntityPath,
  endpoints: EntityActionEndpoints,
  opts: UseEntityActionsOpts<TEntity> = {},
) {
  const [entityType, listKey] = path;

  const api = useApi();
  const dispatch = useAppDispatch();

  const deleteEntity = useDeleteEntity(entityType, (entityId) => {
    if (!endpoints.delete) return Promise.reject(endpoints);
    return api.delete(endpoints.delete.replace(':id', entityId));
  });

  function createEntity(params: P, callbacks: EntityCallbacks = {}): Promise<CreateEntityResult<TEntity>> {
    if (!endpoints.post) return Promise.reject(endpoints);

    return api.post(endpoints.post, params).then((response) => {
      const schema = opts.schema || z.custom<TEntity>();
      const entity = schema.parse(response.data);

      // TODO: optimistic updating
      dispatch(importEntities([entity], entityType, listKey));

      if (callbacks.onSuccess) {
        callbacks.onSuccess(entity);
      }

      return {
        response,
        entity,
      };
    });
  }

  return {
    createEntity: createEntity,
    deleteEntity: endpoints.delete ? deleteEntity : undefined,
  };
}

export { useEntityActions };