import { Entities } from 'soapbox/entity-store/entities';
import { useEntityActions } from 'soapbox/entity-store/hooks';

import type { Group } from 'soapbox/schemas';

function useDeleteGroup() {
  const { deleteEntity, isSubmitting } = useEntityActions<Group>(
    [Entities.GROUPS],
    { delete: '/api/v1/groups/:id' },
  );

  return {
    mutate: deleteEntity,
    isSubmitting,
  };
}

export { useDeleteGroup };