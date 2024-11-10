import { Entities } from 'soapbox/entity-store/entities.ts';
import { useEntities } from 'soapbox/entity-store/hooks/index.ts';
import { useApi, useFeatures } from 'soapbox/hooks/index.ts';
import { groupSchema } from 'soapbox/schemas/index.ts';

import { useGroupRelationships } from './useGroupRelationships.ts';

import type { Group } from 'soapbox/schemas/index.ts';

function useGroupSearch(search: string) {
  const api = useApi();
  const features = useFeatures();

  const { entities, ...result } = useEntities<Group>(
    [Entities.GROUPS, 'discover', 'search', search],
    () => api.get('/api/v1/groups/search', {
      searchParams: {
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