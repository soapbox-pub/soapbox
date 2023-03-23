import { useState } from 'react';

import { useApi } from 'soapbox/hooks';

import { useCreateEntity } from './useCreateEntity';
import { useDeleteEntity } from './useDeleteEntity';
import { parseEntitiesPath } from './utils';

import type { Entity } from '../types';
import type { EntitySchema, ExpandedEntitiesPath } from './types';

interface UseEntityActionsOpts<TEntity extends Entity = Entity> {
  schema?: EntitySchema<TEntity>
}

interface EntityActionEndpoints {
  post?: string
  delete?: string
}

function useEntityActions<TEntity extends Entity = Entity, Params = any>(
  expandedPath: ExpandedEntitiesPath,
  endpoints: EntityActionEndpoints,
  opts: UseEntityActionsOpts<TEntity> = {},
) {
  const api = useApi();
  const { entityType, path } = parseEntitiesPath(expandedPath);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const deleteEntity = useDeleteEntity(entityType, (entityId) => {
    if (!endpoints.delete) return Promise.reject(endpoints);
    return api.delete(endpoints.delete.replace(':id', entityId))
      .finally(() => setIsLoading(false));
  });

  const createEntity = useCreateEntity(path, (params: Params) => {
    if (!endpoints.post) return Promise.reject(endpoints);
    return api.post(endpoints.post, params)
      .finally(() => setIsLoading(false));
  }, opts);

  return {
    createEntity,
    deleteEntity,
    isLoading,
  };
}

export { useEntityActions };