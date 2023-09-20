import { Entities } from 'soapbox/entity-store/entities';
import { useEntities } from 'soapbox/entity-store/hooks';
import { useApi } from 'soapbox/hooks';
import { useFeatures } from 'soapbox/hooks/useFeatures';
import { groupSchema, type Group } from 'soapbox/schemas/group';

import { useGroupRelationships } from './useGroupRelationships';

function useGroups(q: string = '') {
  const api = useApi();
  const features = useFeatures();

  const { entities, ...result } = useEntities<Group>(
    [Entities.GROUPS, 'search', q],
    () => api.get('/api/v1/groups', { params: { q } }),
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
