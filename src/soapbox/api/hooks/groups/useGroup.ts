import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import { Entities } from 'soapbox/entity-store/entities';
import { useEntity } from 'soapbox/entity-store/hooks';
import { useApi } from 'soapbox/hooks';
import { type Group, groupSchema } from 'soapbox/schemas';

import { useGroupRelationship } from './useGroupRelationship';

function useGroup(groupId: string, refetch = true) {
  const api = useApi();
  const history = useHistory();

  const { entity: group, isUnauthorized, ...result } = useEntity<Group>(
    [Entities.GROUPS, groupId],
    () => api.get(`/api/v1/groups/${groupId}`),
    {
      schema: groupSchema,
      refetch,
      enabled: !!groupId,
    },
  );
  const { groupRelationship: relationship } = useGroupRelationship(groupId);

  useEffect(() => {
    if (isUnauthorized) {
      history.push('/login');
    }
  }, [isUnauthorized]);

  return {
    ...result,
    isUnauthorized,
    group: group ? { ...group, relationship: relationship || null } : undefined,
  };
}

export { useGroup };