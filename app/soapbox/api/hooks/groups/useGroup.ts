import { Entities } from 'soapbox/entity-store/entities';
import { useEntity } from 'soapbox/entity-store/hooks';
import { useApi } from 'soapbox/hooks';
import { type Group, groupSchema } from 'soapbox/schemas';

import { useGroupRelationship } from './useGroupRelationship';

function useGroup(groupId: string, refetch = true) {
  const api = useApi();

  const { entity: group, ...result } = useEntity<Group>(
    [Entities.GROUPS, groupId],
    () => api.get(`/api/v1/groups/${groupId}`),
    {
      schema: groupSchema,
      refetch,
      enabled: !!groupId,
    },
  );
  const { entity: relationship } = useGroupRelationship(groupId);

  return {
    ...result,
    group: group ? { ...group, relationship: relationship || null } : undefined,
  };
}

export { useGroup };