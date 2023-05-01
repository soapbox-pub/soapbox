import { useEffect } from 'react';
import { z } from 'zod';

import { fetchGroupRelationshipsSuccess } from 'soapbox/actions/groups';
import { Entities } from 'soapbox/entity-store/entities';
import { useEntities, useEntity } from 'soapbox/entity-store/hooks';
import { useApi, useAppDispatch } from 'soapbox/hooks';
import { useFeatures } from 'soapbox/hooks/useFeatures';
import { groupSchema, Group } from 'soapbox/schemas/group';
import { groupRelationshipSchema, GroupRelationship } from 'soapbox/schemas/group-relationship';

function useGroups(q: string = '') {
  const api = useApi();
  const features = useFeatures();

  const { entities, ...result } = useEntities<Group>(
    [Entities.GROUPS, 'search', q],
    () => api.get('/api/v1/groups', { params: { q } }),
    { enabled: features.groups, schema: groupSchema },
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
  const api = useApi();

  const { entity: group, ...result } = useEntity<Group>(
    [Entities.GROUPS, groupId],
    () => api.get(`/api/v1/groups/${groupId}`),
    { schema: groupSchema, refetch },
  );
  const { entity: relationship } = useGroupRelationship(groupId);

  return {
    ...result,
    group: group ? { ...group, relationship: relationship || null } : undefined,
  };
}

function useGroupRelationship(groupId: string) {
  const api = useApi();
  const dispatch = useAppDispatch();

  const { entity: groupRelationship, ...result } = useEntity<GroupRelationship>(
    [Entities.GROUP_RELATIONSHIPS, groupId],
    () => api.get(`/api/v1/groups/relationships?id[]=${groupId}`),
    { schema: z.array(groupRelationshipSchema).transform(arr => arr[0]) },
  );

  useEffect(() => {
    if (groupRelationship?.id) {
      dispatch(fetchGroupRelationshipsSuccess([groupRelationship]));
    }
  }, [groupRelationship?.id]);

  return {
    entity: groupRelationship,
    ...result,
  };
}

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

export { useGroup, useGroups, useGroupRelationship, useGroupRelationships };
