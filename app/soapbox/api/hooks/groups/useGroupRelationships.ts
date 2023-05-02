import { Entities } from 'soapbox/entity-store/entities';
import { useEntities } from 'soapbox/entity-store/hooks';
import { useApi } from 'soapbox/hooks';
import { type GroupRelationship, groupRelationshipSchema } from 'soapbox/schemas';

function useGroupRelationships(groupIds: string[]) {
  const api = useApi();
  const q = groupIds.map(id => `id[]=${id}`).join('&');

  const { entities, ...result } = useEntities<GroupRelationship>(
    [Entities.GROUP_RELATIONSHIPS, ...groupIds],
    () => api.get(`/api/v1/groups/relationships?${q}`),
    { schema: groupRelationshipSchema, enabled: groupIds.length > 0 },
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

export { useGroupRelationships };