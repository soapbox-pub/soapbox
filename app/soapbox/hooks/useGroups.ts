import { useEffect } from 'react';

import { useEntities } from 'soapbox/entity-store/hooks';
import { normalizeGroup } from 'soapbox/normalizers';

import type { Group } from 'soapbox/types/entities';

function useGroups() {
  const result = useEntities<Group>(['Group', ''], '/api/v1/groups');
  const { entities, isLoading, fetchEntities } = result;

  useEffect(() => {
    if (!isLoading) {
      fetchEntities();
    }
  }, []);

  return {
    ...result,
    groups: entities.map(normalizeGroup),
  };
}

export { useGroups };