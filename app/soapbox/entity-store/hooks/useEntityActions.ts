import { z } from 'zod';

import { useApi, useAppDispatch } from 'soapbox/hooks';

import { importEntities } from '../actions';

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

interface DeleteEntityResult {
  response: AxiosResponse
}

interface EntityActionEndpoints {
  post?: string
  delete?: string
}

function useEntityActions<TEntity extends Entity = Entity, P = any>(
  path: EntityPath,
  endpoints: EntityActionEndpoints,
  opts: UseEntityActionsOpts<TEntity> = {},
) {
  const api = useApi();
  const dispatch = useAppDispatch();
  const [entityType, listKey] = path;

  function createEntity(params: P): Promise<CreateEntityResult<TEntity>> {
    if (!endpoints.post) return Promise.reject(endpoints);

    return api.post(endpoints.post, params).then((response) => {
      const schema = opts.schema || z.custom<TEntity>();
      const entity = schema.parse(response.data);

      // TODO: optimistic updating
      dispatch(importEntities([entity], entityType, listKey));

      return {
        response,
        entity,
      };
    });
  }

  function deleteEntity(entityId: string): Promise<DeleteEntityResult> {
    if (!endpoints.delete) return Promise.reject(endpoints);
    return api.delete(endpoints.delete.replaceAll(':id', entityId)).then((response) => {

      return {
        response,
      };
    });
  }

  return {
    createEntity: createEntity,
    deleteEntity: endpoints.delete ? deleteEntity : undefined,
  };
}

export { useEntityActions };