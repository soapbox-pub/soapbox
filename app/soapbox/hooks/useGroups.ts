import { useEntities, useEntity } from 'soapbox/entity-store/hooks';
import { normalizeGroup, normalizeGroupRelationship } from 'soapbox/normalizers';

import type { Group, GroupRelationship } from 'soapbox/types/entities';

function useGroups() {
  const { entities, ...result } = useEntities<Group>(['Group', ''], '/api/v1/groups', { parser: parseGroup });
  const { relationships } = useGroupRelationships(entities.map(entity => entity.id));

  const groups = entities.map((group) => group.set('relationship', relationships[group.id] || null));

  return {
    ...result,
    groups,
  };
}

function useGroup(groupId: string, refetch = true) {
  const { entity: group, ...result } = useEntity<Group>(['Group', groupId], `/api/v1/groups/${groupId}`, { parser: parseGroup, refetch });
  const { entity: relationship } = useGroupRelationship(groupId);

  return {
    ...result,
    group: group?.set('relationship', relationship || null),
  };
}

function useGroupRelationship(groupId: string) {
  return useEntity<GroupRelationship>(['GroupRelationship', groupId], `/api/v1/groups/relationships?id[]=${groupId}`, { parser: parseGroupRelationship });
}

function useGroupRelationships(groupIds: string[]) {
  const q = groupIds.map(id => `id[]=${id}`).join('&');
  const endpoint = groupIds.length ? `/api/v1/groups/relationships?${q}` : undefined;
  const { entities, ...result } = useEntities<GroupRelationship>(['GroupRelationship', q], endpoint, { parser: parseGroupRelationship });

  const relationships = entities.reduce<Record<string, GroupRelationship>>((map, relationship) => {
    map[relationship.id] = relationship;
    return map;
  }, {});

  return {
    ...result,
    relationships,
  };
}

// HACK: normalizers currently don't have the desired API.
// TODO: rewrite normalizers as Zod parsers.
const parseGroup = (entity: unknown) => entity ? normalizeGroup(entity as Record<string, any>) : undefined;
const parseGroupRelationship = (entity: unknown) => entity ? normalizeGroupRelationship(entity as Record<string, any>) : undefined;

export { useGroup, useGroups };