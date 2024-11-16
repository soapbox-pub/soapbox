import { useApi } from 'soapbox/hooks/useApi.ts';

import { useCreateEntity } from './useCreateEntity.ts';
import { useDeleteEntity } from './useDeleteEntity.ts';
import { parseEntitiesPath } from './utils.ts';

import type { EntitySchema, ExpandedEntitiesPath } from './types.ts';
import type { Entity } from '../types.ts';

interface UseEntityActionsOpts<TEntity extends Entity = Entity> {
  schema?: EntitySchema<TEntity>;
}

interface EntityActionEndpoints {
  delete?: string;
  patch?: string;
  post?: string;
}

function useEntityActions<TEntity extends Entity = Entity, Data = any>(
  expandedPath: ExpandedEntitiesPath,
  endpoints: EntityActionEndpoints,
  opts: UseEntityActionsOpts<TEntity> = {},
) {
  const api = useApi();
  const { entityType, path } = parseEntitiesPath(expandedPath);

  const { deleteEntity, isSubmitting: deleteSubmitting } =
    useDeleteEntity(entityType, (entityId) => api.delete(endpoints.delete!.replace(/:id/g, entityId)));

  const { createEntity, isSubmitting: createSubmitting } =
    useCreateEntity<TEntity, Data>(path, (data) => api.post(endpoints.post!, data), opts);

  const { createEntity: updateEntity, isSubmitting: updateSubmitting } =
    useCreateEntity<TEntity, Data>(path, (data) => api.patch(endpoints.patch!, data), opts);

  return {
    createEntity,
    deleteEntity,
    updateEntity,
    isSubmitting: createSubmitting || deleteSubmitting || updateSubmitting,
  };
}

export { useEntityActions };