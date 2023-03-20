import { Entities } from 'soapbox/entity-store/entities';
import { useEntityActions } from 'soapbox/entity-store/hooks';
import { useOwnAccount } from 'soapbox/hooks';

import type { Group, GroupRelationship } from 'soapbox/schemas';

function useCancelMembershipRequest(group: Group) {
  const me = useOwnAccount();

  const { createEntity, isLoading } = useEntityActions<GroupRelationship>(
    [Entities.GROUP_RELATIONSHIPS, group.id],
    { post: `/api/v1/groups/${group.id}/membership_requests/${me?.id}/reject` },
  );

  return {
    mutate: createEntity,
    isLoading,
  };
}

export { useCancelMembershipRequest };
