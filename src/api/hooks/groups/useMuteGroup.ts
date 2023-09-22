import { Entities } from 'soapbox/entity-store/entities';
import { useEntityActions } from 'soapbox/entity-store/hooks';
import { type Group, groupRelationshipSchema } from 'soapbox/schemas';

function useMuteGroup(group?: Group) {
  const { createEntity, isSubmitting } = useEntityActions(
    [Entities.GROUP_RELATIONSHIPS, group?.id as string],
    { post: `/api/v1/groups/${group?.id}/mute` },
    { schema: groupRelationshipSchema },
  );

  return {
    mutate: createEntity,
    isSubmitting,
  };
}

export { useMuteGroup };