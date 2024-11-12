import { Entities } from 'soapbox/entity-store/entities.ts';
import { useEntities } from 'soapbox/entity-store/hooks/index.ts';
import { Group, groupSchema } from 'soapbox/schemas/index.ts';

import { useApi } from '../../../hooks/useApi.ts';
import { useFeatures } from '../../../hooks/useFeatures.ts';

import { useGroupRelationships } from './useGroupRelationships.ts';

function usePopularGroups() {
  const api = useApi();
  const features = useFeatures();

  const { entities, ...result } = useEntities<Group>(
    [Entities.GROUPS, 'popular'],
    () => api.get('/api/v1/truth/trends/groups'),
    {
      schema: groupSchema,
      enabled: features.groupsDiscovery,
    },
  );

  const { relationships } = useGroupRelationships(['popular'], entities.map(entity => entity.id));

  const groups = entities.map((group) => ({
    ...group,
    relationship: relationships[group.id] || null,
  }));

  return {
    ...result,
    groups,
  };
}

export { usePopularGroups };