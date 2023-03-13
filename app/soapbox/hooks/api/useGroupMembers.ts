import { Entities } from 'soapbox/entity-store/entities';
import { useEntities } from 'soapbox/entity-store/hooks';
import { normalizeAccount } from 'soapbox/normalizers';
import { Account } from 'soapbox/types/entities';

import { BaseGroupRoles, TruthSocialGroupRoles } from '../useGroupRoles';

interface GroupMember {
  id: string
  role: BaseGroupRoles | TruthSocialGroupRoles
  account: Account | any
}

const normalizeGroupMember = (groupMember: GroupMember): GroupMember => {
  return {
    ...groupMember,
    account: normalizeAccount(groupMember.account),
  };
};

const parseGroupMember = (entity: unknown) => entity ? normalizeGroupMember(entity as GroupMember) : undefined;

function useGroupMembers(groupId: string, role: string) {
  const { entities, ...result } = useEntities<GroupMember>(
    [Entities.GROUP_MEMBERSHIPS, `${groupId}:${role}`],
    `/api/v1/groups/${groupId}/memberships?role=${role}&limit=1`,
    { parser: parseGroupMember },
  );

  return {
    ...result,
    groupMembers: entities,
  };
}

export { useGroupMembers };