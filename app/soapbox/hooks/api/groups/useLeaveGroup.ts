import { Entities } from 'soapbox/entity-store/entities';
import { useEntityActions } from 'soapbox/entity-store/hooks';
import { Group, GroupRelationship, groupRelationshipSchema } from 'soapbox/schemas';

function useLeaveGroup(group: Group) {
  const { createEntity, isLoading } = useEntityActions<GroupRelationship>(
    [Entities.GROUP_RELATIONSHIPS, group.id],
    { post: `/api/v1/groups/${group.id}/leave` },
    { schema: groupRelationshipSchema },
  );

  return {
    mutate: createEntity,
    isLoading,
  };
}

export { useLeaveGroup };
