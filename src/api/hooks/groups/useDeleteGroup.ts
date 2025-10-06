import { Entities } from '@/entity-store/entities.ts';
import { useEntityActions } from '@/entity-store/hooks/index.ts';

import type { Group } from '@/schemas/index.ts';

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