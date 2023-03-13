import { Entities } from 'soapbox/entity-store/entities';
import { useEntities } from 'soapbox/entity-store/hooks';
import { GroupMember, groupMemberSchema } from 'soapbox/schemas';

const parseGroupMember = (entity: unknown) => {
  const result = groupMemberSchema.safeParse(entity);
  if (result.success) {
    return result.data;
  }
};

function useGroupMembers(groupId: string, role: string) {
  const { entities, ...result } = useEntities<GroupMember>(
    [Entities.GROUP_MEMBERSHIPS, groupId, role],
    `/api/v1/groups/${groupId}/memberships?role=${role}&limit=1`,
    { parser: parseGroupMember },
  );

  return {
    ...result,
    groupMembers: entities,
  };
}

export { useGroupMembers };