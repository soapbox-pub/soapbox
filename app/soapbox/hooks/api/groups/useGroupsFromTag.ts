import { Entities } from 'soapbox/entity-store/entities';
import { useEntities } from 'soapbox/entity-store/hooks';
import { groupSchema } from 'soapbox/schemas';

import { useApi } from '../../useApi';
import { useFeatures } from '../../useFeatures';

import type { Group } from 'soapbox/schemas';

function useGroupsFromTag(tagId: string) {
  const api = useApi();
  const features = useFeatures();

  const { entities, ...result } = useEntities<Group>(
    [Entities.GROUPS, 'tags', tagId],
    () => api.get(`/api/mock/tags/${tagId}/groups`),
    {
      schema: groupSchema,
      enabled: features.groupsDiscovery,
    },
  );

  return {
    ...result,
    groups: entities,
  };
}

export { useGroupsFromTag };