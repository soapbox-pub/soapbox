import { Entities } from 'soapbox/entity-store/entities.ts';
import { useEntities } from 'soapbox/entity-store/hooks/index.ts';
import { useApi } from 'soapbox/hooks/useApi.ts';
import { useFeatures } from 'soapbox/hooks/useFeatures.ts';
import { groupSchema } from 'soapbox/schemas/index.ts';

import { useGroupRelationships } from './useGroupRelationships.ts';

import type { Group } from 'soapbox/schemas/index.ts';

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