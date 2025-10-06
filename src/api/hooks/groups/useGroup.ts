import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import { Entities } from '@/entity-store/entities.ts';
import { useEntity } from '@/entity-store/hooks/index.ts';
import { useApi } from '@/hooks/useApi.ts';
import { type Group, groupSchema } from '@/schemas/index.ts';

import { useGroupRelationship } from './useGroupRelationship.ts';

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