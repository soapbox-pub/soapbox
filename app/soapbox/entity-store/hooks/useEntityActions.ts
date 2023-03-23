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
  delete?: string
  patch?: string
  post?: string
}

function useEntityActions<TEntity extends Entity = Entity, Data = any>(
  expandedPath: ExpandedEntitiesPath,
  endpoints: EntityActionEndpoints,
  opts: UseEntityActionsOpts<TEntity> = {},
) {
  const api = useApi();
  const { entityType, path } = parseEntitiesPath(expandedPath);

  const { deleteEntity, isSubmitting: deleteSubmitting } =
    useDeleteEntity(entityType, (entityId) => api.delete(endpoints.delete!.replaceAll(':id', entityId)));

  const { createEntity, isSubmitting: createSubmitting } =
    useCreateEntity<TEntity, Data>(path, (data) => api.post(endpoints.post!, data), opts);

  return {
    createEntity,
    deleteEntity,
    isSubmitting: createSubmitting || deleteSubmitting,
  };
}

export { useEntityActions };