import { Entities } from 'soapbox/entity-store/entities';
import { useEntities } from 'soapbox/entity-store/hooks';
import { GroupMember, groupMemberSchema } from 'soapbox/schemas';

function useGroupMembers(groupId: string, role: string) {
  const { entities, ...result } = useEntities<GroupMember>(
    [Entities.GROUP_MEMBERSHIPS, groupId, role],
    `/api/v1/groups/${groupId}/memberships?role=${role}`,
    { schema: groupMemberSchema },
  );

  return {
    ...result,
    groupMembers: entities,
  };
}

export { useGroupMembers };