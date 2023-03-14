import { Entities } from 'soapbox/entity-store/entities';
import { useEntities, useEntity } from 'soapbox/entity-store/hooks';
import { groupSchema, Group } from 'soapbox/schemas/group';
import { groupRelationshipSchema, GroupRelationship } from 'soapbox/schemas/group-relationship';

function useGroups() {
  const { entities, ...result } = useEntities<Group>(
    [Entities.GROUPS, ''],
    '/api/v1/groups',
    { schema: groupSchema },
  );
  const { relationships } = useGroupRelationships(entities.map(entity => entity.id));

  const groups = entities.map((group) => ({
    ...group,
    relationship: relationships[group.id] || null,
  }));

  return {
    ...result,
    groups,
  };
}

function useGroup(groupId: string, refetch = true) {
  const { entity: group, ...result } = useEntity<Group>(
    [Entities.GROUPS, groupId],
    `/api/v1/groups/${groupId}`,
    { schema: groupSchema, refetch },
  );
  const { entity: relationship } = useGroupRelationship(groupId);

  return {
    ...result,
    group: group ? { ...group, relationship: relationship || null } : undefined,
  };
}

function useGroupRelationship(groupId: string) {
  return useEntity<GroupRelationship>(
    [Entities.GROUP_RELATIONSHIPS, groupId],
    `/api/v1/groups/relationships?id[]=${groupId}`,
    { schema: groupRelationshipSchema },
  );
}

function useGroupRelationships(groupIds: string[]) {
  const q = groupIds.map(id => `id[]=${id}`).join('&');
  const endpoint = groupIds.length ? `/api/v1/groups/relationships?${q}` : undefined;
  const { entities, ...result } = useEntities<GroupRelationship>(
    [Entities.GROUP_RELATIONSHIPS, q],
    endpoint,
    { schema: groupRelationshipSchema },
  );

  const relationships = entities.reduce<Record<string, GroupRelationship>>((map, relationship) => {
    map[relationship.id] = relationship;
    return map;
  }, {});

  return {
    ...result,
    relationships,
  };
}

export { useGroup, useGroups, useGroupRelationships };
