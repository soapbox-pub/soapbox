import { Entities } from 'soapbox/entity-store/entities.ts';
import { useEntities } from 'soapbox/entity-store/hooks/index.ts';
import { useApi } from 'soapbox/hooks/useApi.ts';
import { useFeatures } from 'soapbox/hooks/useFeatures.ts';
import { groupSchema, type Group } from 'soapbox/schemas/group.ts';

import { useGroupRelationships } from './useGroupRelationships.ts';

function useGroups(q: string = '') {
  const api = useApi();
  const features = useFeatures();

  const { entities, ...result } = useEntities<Group>(
    [Entities.GROUPS, 'search', q],
    () => api.get('/api/v1/groups', { searchParams: { q } }),
    { enabled: features.groups, schema: groupSchema },
  );
  const { relationships } = useGroupRelationships(
    ['search', q],
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

export { useGroups };
