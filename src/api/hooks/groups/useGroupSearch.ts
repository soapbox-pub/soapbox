import { Entities } from '@/entity-store/entities.ts';
import { useEntities } from '@/entity-store/hooks/index.ts';
import { useApi } from '@/hooks/useApi.ts';
import { useFeatures } from '@/hooks/useFeatures.ts';
import { groupSchema } from '@/schemas/index.ts';

import { useGroupRelationships } from './useGroupRelationships.ts';

import type { Group } from '@/schemas/index.ts';

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