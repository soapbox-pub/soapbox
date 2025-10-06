import { Entities } from '@/entity-store/entities.ts';
import { useDeleteEntity } from '@/entity-store/hooks/index.ts';
import { useApi } from '@/hooks/useApi.ts';

import type { Group } from '@/schemas/index.ts';

function useDeleteGroupStatus(group: Group, statusId: string) {
  const api = useApi();
  const { deleteEntity, isSubmitting } = useDeleteEntity(
    Entities.STATUSES,
    () => api.delete(`/api/v1/groups/${group.id}/statuses/${statusId}`),
  );

  return {
    mutate: deleteEntity,
    isSubmitting,
  };
}

export { useDeleteGroupStatus };