import { Entities } from 'soapbox/entity-store/entities';
import { useEntities } from 'soapbox/entity-store/hooks';
import { GroupTag, groupTagSchema } from 'soapbox/schemas';

import { useApi } from '../../useApi';
import { useFeatures } from '../../useFeatures';

function usePopularTags() {
  const api = useApi();
  const features = useFeatures();

  const { entities, ...result } = useEntities<GroupTag>(
    [Entities.GROUP_TAGS],
    () => api.get('/api/v1/groups/tags'),
    {
      schema: groupTagSchema,
      enabled: features.groupsDiscovery,
    },
  );

  return {
    ...result,
    tags: entities,
  };
}

export { usePopularTags };