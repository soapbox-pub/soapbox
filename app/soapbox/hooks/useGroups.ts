import { useEffect } from 'react';

import { useEntities, useEntity } from 'soapbox/entity-store/hooks';
import { normalizeGroup } from 'soapbox/normalizers';

import type { Group } from 'soapbox/types/entities';

function useGroups() {
  const result = useEntities<Group>(['Group', ''], '/api/v1/groups');
  const { entities, isLoading, fetchEntities } = result;

  // Note: we have to fetch them in the hook right now because I haven't implemented
  // max-age or cache expiry in the entity store yet. It's planned.
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

export { useGroup, useGroups };