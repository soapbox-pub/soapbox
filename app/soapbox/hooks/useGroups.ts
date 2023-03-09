import { useEffect } from 'react';

import { useEntities, useEntity } from 'soapbox/entity-store/hooks';
import { normalizeGroup, normalizeGroupRelationship } from 'soapbox/normalizers';

import type { Group, GroupRelationship } from 'soapbox/types/entities';

// HACK: normalizers currently don't have the desired API.
// TODO: rewrite normalizers as Zod parsers.
const parseGroup = (entity: unknown) => normalizeGroup(entity as Record<string, any>);
const parseGroupRelationship = (entity: unknown) => normalizeGroupRelationship(entity as Record<string, any>);

function useGroups() {
  const result = useEntities<Group>(['Group', ''], '/api/v1/groups', { parser: parseGroup });
  const { entities, isLoading, fetchEntities } = result;
  const { entities: relationships } = useGroupRelationships(entities.map(entity => entity.id));

  // Note: we have to fetch them in the hook right now because I haven't implemented
  // max-age or cache expiry in the entity store yet. It's planned.
  useEffect(() => {
    if (!isLoading) {
      fetchEntities();
    }
  }, []);

  const groups = entities.map((group) => {
    // TODO: a generalistic useRelationships() hook that returns a map of values (would be faster).
    const relationship = relationships.find(r => r.id === group.id);
    if (relationship) {
      return group.set('relationship', relationship);
    }
    return group;
  });

  return {
    ...result,
    groups,
  };
}

function useGroup(groupId: string) {
  const result = useEntity<Group>(['Group', groupId], `/api/v1/groups/${groupId}`, { parser: parseGroup });
  const { entity, isLoading, fetchEntity } = result;
  const { relationship } = useGroupRelationship(groupId);

  useEffect(() => {
    if (!isLoading) {
      fetchEntity();
    }
  }, []);

  return {
    ...result,
    group: entity?.set('relationship', relationship),
  };
}

function useGroupRelationship(groupId: string) {
  const { relationships, ...rest } = useGroupRelationships([groupId]);
  return {
    ...rest,
    relationship: relationships[0],
  };
}

function useGroupRelationships(groupIds: string[]) {
  const q = groupIds.map(id => `id[]=${id}`).join('&');
  const result = useEntities<GroupRelationship>(['GroupRelationship', ''], `/api/v1/groups/relationships?${q}`, { parser: parseGroupRelationship });
  const { entities, isLoading, fetchEntities } = result;

  useEffect(() => {
    if (!isLoading) {
      fetchEntities();
    }
  }, groupIds);

  return {
    ...result,
    relationships: entities,
  };
}

export { useGroup, useGroups };