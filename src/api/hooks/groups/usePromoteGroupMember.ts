import { z } from 'zod';

import { Entities } from 'soapbox/entity-store/entities.ts';
import { useEntityActions } from 'soapbox/entity-store/hooks/index.ts';
import { groupMemberSchema } from 'soapbox/schemas/index.ts';

import type { Group, GroupMember } from 'soapbox/schemas/index.ts';

function usePromoteGroupMember(group: Group, groupMember: GroupMember) {
  const { createEntity } = useEntityActions<GroupMember>(
    [Entities.GROUP_MEMBERSHIPS, groupMember.account.id],
    { post: `/api/v1/groups/${group.id}/promote` },
    { schema: z.array(groupMemberSchema).transform((arr) => arr[0]) },
  );

  return createEntity;
}

export { usePromoteGroupMember };