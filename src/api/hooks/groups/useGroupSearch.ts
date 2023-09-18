import { Entities } from 'soapbox/entity-store/entities';
import { useEntities } from 'soapbox/entity-store/hooks';
import { useApi, useFeatures } from 'soapbox/hooks';
import { groupSchema } from 'soapbox/schemas';

import { useGroupRelationships } from './useGroupRelationships';

import type { Group } from 'soapbox/schemas';

function useGroupSearch(search: string) {
  const api = useApi();
  const features = useFeatures();

  const { entities, ...result } = useEntities<Group>(
    [Entities.GROUPS, 'discover', 'search', search],
    () => api.get('/api/v1/groups/search', {
      params: {
        q: search,
      },
    }),
    { enabled: features.groupsDiscovery && !!search, schema: groupSchema },
  );

  const { relationships } = useGroupRelationships(
    ['discover', 'search', search],
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

export { useGroupSearch };