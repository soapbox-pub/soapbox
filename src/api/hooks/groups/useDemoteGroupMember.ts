import { z } from 'zod';

import { Entities } from '@/entity-store/entities.ts';
import { useEntityActions } from '@/entity-store/hooks/index.ts';
import { groupMemberSchema } from '@/schemas/index.ts';

import type { Group, GroupMember } from '@/schemas/index.ts';

function useDemoteGroupMember(group: Group, groupMember: GroupMember) {
  const { createEntity } = useEntityActions<GroupMember>(
    [Entities.GROUP_MEMBERSHIPS, groupMember.id],
    { post: `/api/v1/groups/${group.id}/demote` },
    { schema: z.array(groupMemberSchema).transform((arr) => arr[0]) },
  );

  return createEntity;
}

export { useDemoteGroupMember };