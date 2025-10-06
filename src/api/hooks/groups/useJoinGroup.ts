import { Entities } from '@/entity-store/entities.ts';
import { useEntityActions } from '@/entity-store/hooks/index.ts';
import { groupRelationshipSchema } from '@/schemas/index.ts';

import { useGroups } from './useGroups.ts';

import type { Group, GroupRelationship } from '@/schemas/index.ts';

function useJoinGroup(group: Group) {
  const { invalidate } = useGroups();

  const { createEntity, isSubmitting } = useEntityActions<GroupRelationship>(
    [Entities.GROUP_RELATIONSHIPS, group.id],
    { post: `/api/v1/groups/${group.id}/join` },
    { schema: groupRelationshipSchema },
  );

  return {
    mutate: createEntity,
    isSubmitting,
    invalidate,
  };
}

export { useJoinGroup };