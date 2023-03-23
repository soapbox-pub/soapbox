import { useState } from 'react';

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

function useEntityActions<TEntity extends Entity = Entity, Data = any>(
  expandedPath: ExpandedEntitiesPath,
  endpoints: EntityActionEndpoints,
  opts: UseEntityActionsOpts<TEntity> = {},
) {
  const { entityType, path } = parseEntitiesPath(expandedPath);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const _delete = useDeleteEntity(entityType, { method: 'delete', url: endpoints.delete });
  const create = useCreateEntity<TEntity, Data>(path, { method: 'post', url: endpoints.post }, opts);

  const createEntity: typeof create = async (...args) => {
    setIsLoading(true);
    await create(...args);
    setIsLoading(false);
  };

  const deleteEntity: typeof _delete = async (...args) => {
    setIsLoading(true);
    await _delete(...args);
    setIsLoading(false);
  };

  return {
    createEntity,
    deleteEntity,
    isLoading,
  };
}

export { useEntityActions };