import { useEffect } from 'react';

import { useEntity } from 'soapbox/entity-store/hooks';
import { normalizeGroup } from 'soapbox/normalizers';

import type { Group } from 'soapbox/types/entities';

function useGroup(groupId: string) {
  const result = useEntity<Group>(['Group', groupId], `/api/v1/groups/${groupId}`);
  const { entity, isLoading, fetchEntity } = result;

  useEffect(() => {
    if (!isLoading) {
      fetchEntity();
    }
  }, []);

  return {
    ...result,
    group: entity ? normalizeGroup(entity) : undefined,
  };
}

export { useGroup };