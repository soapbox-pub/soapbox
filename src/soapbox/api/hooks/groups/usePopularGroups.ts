import { Entities } from 'soapbox/entity-store/entities';
import { useEntities } from 'soapbox/entity-store/hooks';
import { Group, groupSchema } from 'soapbox/schemas';

import { useApi } from '../../../hooks/useApi';
import { useFeatures } from '../../../hooks/useFeatures';

import { useGroupRelationships } from './useGroupRelationships';

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