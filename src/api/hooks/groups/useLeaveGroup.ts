import { Entities } from 'soapbox/entity-store/entities.ts';
import { useEntityActions } from 'soapbox/entity-store/hooks/index.ts';
import { groupRelationshipSchema } from 'soapbox/schemas/index.ts';

import { useGroups } from './useGroups.ts';

import type { Group, GroupRelationship } from 'soapbox/schemas/index.ts';

function useLeaveGroup(group: Group) {
  const { invalidate } = useGroups();

  const { createEntity, isSubmitting } = useEntityActions<GroupRelationship>(
    [Entities.GROUP_RELATIONSHIPS, group.id],
    { post: `/api/v1/groups/${group.id}/leave` },
    { schema: groupRelationshipSchema },
  );

  return {
    mutate: createEntity,
    isSubmitting,
    invalidate,
  };
}

export { useLeaveGroup };
