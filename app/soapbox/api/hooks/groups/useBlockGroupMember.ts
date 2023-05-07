import { Entities } from 'soapbox/entity-store/entities';
import { useEntityActions } from 'soapbox/entity-store/hooks';

import type { Group, GroupMember } from 'soapbox/schemas';

function useBlockGroupMember(group: Group, groupMember: GroupMember) {
  const { createEntity } = useEntityActions<GroupMember>(
    [Entities.GROUP_MEMBERSHIPS, groupMember.id],
    { post: `/api/v1/groups/${group.id}/blocks` },
  );

  return createEntity;
}

export { useBlockGroupMember };