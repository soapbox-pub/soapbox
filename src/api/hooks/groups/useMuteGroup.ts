import { Entities } from '@/entity-store/entities.ts';
import { useEntityActions } from '@/entity-store/hooks/index.ts';
import { type Group, groupRelationshipSchema } from '@/schemas/index.ts';

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