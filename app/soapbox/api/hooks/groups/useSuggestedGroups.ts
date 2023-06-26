import { Entities } from 'soapbox/entity-store/entities';
import { useEntities } from 'soapbox/entity-store/hooks';
import { useApi, useFeatures } from 'soapbox/hooks';
import { type Group, groupSchema } from 'soapbox/schemas';

import { useGroupRelationships } from './useGroupRelationships';

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