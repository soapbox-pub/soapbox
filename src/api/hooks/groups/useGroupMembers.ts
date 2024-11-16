import { Entities } from 'soapbox/entity-store/entities.ts';
import { useEntities } from 'soapbox/entity-store/hooks/index.ts';
import { GroupRoles } from 'soapbox/schemas/group-member.ts';
import { GroupMember, groupMemberSchema } from 'soapbox/schemas/index.ts';

import { useApi } from '../../../hooks/useApi.ts';

function useGroupMembers(groupId: string, role: GroupRoles) {
  const api = useApi();

  const { entities, ...result } = useEntities<GroupMember>(
    [Entities.GROUP_MEMBERSHIPS, groupId, role],
    () => api.get(`/api/v1/groups/${groupId}/memberships?role=${role}`),
    { schema: groupMemberSchema },
  );

  return {
    ...result,
    groupMembers: entities,
  };
}

export { useGroupMembers };