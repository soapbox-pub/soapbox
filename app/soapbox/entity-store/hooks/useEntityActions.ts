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

  const { deleteEntity, isLoading: deleteLoading } =
    useDeleteEntity(entityType, { method: 'delete', url: endpoints.delete });

  const { createEntity, isLoading: createLoading } =
    useCreateEntity<TEntity, Data>(path, { method: 'post', url: endpoints.post }, opts);

  return {
    createEntity,
    deleteEntity,
    isLoading: createLoading || deleteLoading,
  };
}

export { useEntityActions };