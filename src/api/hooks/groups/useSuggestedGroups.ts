import { Entities } from 'soapbox/entity-store/entities.ts';
import { useEntities } from 'soapbox/entity-store/hooks/index.ts';
import { useApi, useFeatures } from 'soapbox/hooks/index.ts';
import { type Group, groupSchema } from 'soapbox/schemas/index.ts';

import { useGroupRelationships } from './useGroupRelationships.ts';

function useSuggestedGroups() {
  const api = useApi();
  const features = useFeatures();

  const { entities, ...result } = useEntities<Group>(
    [Entities.GROUPS, 'suggested'],
    () => api.get('/api/v1/truth/suggestions/groups'),
    {
      schema: groupSchema,
      enabled: features.groupsDiscovery,
    },
  );

  const { relationships } = useGroupRelationships(['suggested'], entities.map(entity => entity.id));

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