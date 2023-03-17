import { z } from 'zod';

import { Entities } from 'soapbox/entity-store/entities';
import { useEntityActions } from 'soapbox/entity-store/hooks';
import { groupMemberSchema } from 'soapbox/schemas';

import type { Group, GroupMember } from 'soapbox/schemas';

function useDemoteGroupMember(group: Group, groupMember: GroupMember) {
  const { createEntity } = useEntityActions<GroupMember>(
    [Entities.GROUP_MEMBERSHIPS, groupMember.id],
    { post: `/api/v1/groups/${group.id}/demote` },
    { schema: z.array(groupMemberSchema).transform((arr) => arr[0]) },
  );

  return createEntity;
}

export { useDemoteGroupMember };