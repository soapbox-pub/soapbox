import { Entities } from 'soapbox/entity-store/entities';
import { useEntities } from 'soapbox/entity-store/hooks';
import { useApi, useFeatures } from 'soapbox/hooks';
import { groupSchema } from 'soapbox/schemas';

import { useGroupRelationships } from './useGroupRelationships';

import type { Group } from 'soapbox/schemas';

function useGroupsFromTag(tagId: string) {
  const api = useApi();
  const features = useFeatures();

  const { entities, ...result } = useEntities<Group>(
    [Entities.GROUPS, 'tags', tagId],
    () => api.get(`/api/v1/tags/${tagId}/groups`),
    {
      schema: groupSchema,
      enabled: features.groupsDiscovery,
    },
  );
  const { relationships } = useGroupRelationships(
    ['tags', tagId],
    entities.map(entity => entity.id),
  );

  const groups = entities.map((group) => ({
    ...group,
    relationship: relationships[group.id] || null,
  }));

  return {
    ...result,
    groups,
  };
}

export { useGroupsFromTag };