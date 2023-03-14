import { Entities } from 'soapbox/entity-store/entities';
import { useEntities } from 'soapbox/entity-store/hooks';
import { Group, groupSchema } from 'soapbox/schemas';

import { useFeatures } from '../useFeatures';
import { useGroupRelationships } from '../useGroups';

function useSuggestedGroups() {
  const features = useFeatures();

  const { entities, ...result } = useEntities<Group>(
    [Entities.SUGGESTED_GROUPS, ''],
    '/api/mock/groups', // '/api/v1/truth/suggestions/groups'
    {
      schema: groupSchema,
      enabled: features.groupsDiscovery,
    },
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

export { useSuggestedGroups };