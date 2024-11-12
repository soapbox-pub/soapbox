import { Entities } from 'soapbox/entity-store/entities.ts';
import { useEntityActions } from 'soapbox/entity-store/hooks/index.ts';

import type { Group } from 'soapbox/schemas/index.ts';

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