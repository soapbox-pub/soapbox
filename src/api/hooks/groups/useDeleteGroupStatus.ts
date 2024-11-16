import { Entities } from 'soapbox/entity-store/entities.ts';
import { useDeleteEntity } from 'soapbox/entity-store/hooks/index.ts';
import { useApi } from 'soapbox/hooks/useApi.ts';

import type { Group } from 'soapbox/schemas/index.ts';

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