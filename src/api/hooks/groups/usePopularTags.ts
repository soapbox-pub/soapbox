import { Entities } from 'soapbox/entity-store/entities.ts';
import { useEntities } from 'soapbox/entity-store/hooks/index.ts';
import { useApi, useFeatures } from 'soapbox/hooks/index.ts';
import { type GroupTag, groupTagSchema } from 'soapbox/schemas/index.ts';

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