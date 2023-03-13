import { Entities } from 'soapbox/entity-store/entities';
import { useEntities } from 'soapbox/entity-store/hooks';
import { Group, groupSchema } from 'soapbox/schemas';

import { useFeatures } from '../useFeatures';
import { useGroupRelationships } from '../useGroups';

function usePopularGroups() {
  const features = useFeatures();

  const { entities, ...result } = useEntities<Group>(
    [Entities.POPULAR_GROUPS, ''],
    '/api/mock/groups', // '/api/v1/truth/trends/groups'
    {
      parser: parseGroup,
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

const parseGroup = (entity: unknown) => {
  const result = groupSchema.safeParse(entity);
  if (result.success) {
    return result.data;
  }
};

export { usePopularGroups };