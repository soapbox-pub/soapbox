import { useQuery } from '@tanstack/react-query';

import { useApi } from 'soapbox/hooks';
import { useGroupRoles } from 'soapbox/hooks/useGroupRoles';
import { normalizeAccount } from 'soapbox/normalizers';

const GroupMemberKeys = {
  members: (id: string, role: string) => ['group', id, role] as const,
};

const useGroupMembers = (groupId: string, role: ReturnType<typeof useGroupRoles>['roles']['admin']) => {
  const api = useApi();

  const getQuery = async () => {
    const { data } = await api.get(`/api/v1/groups/${groupId}/memberships`, {
      params: {
        role,
      },
    });

    const result = data.map((member: any) => {
      return {
        ...member,
        account: normalizeAccount(member.account),
      };
    });

    return result;
  };

  return useQuery(
    GroupMemberKeys.members(groupId, role),
    getQuery,
    {
      placeholderData: [],
    },
  );
};

export { useGroupMembers };