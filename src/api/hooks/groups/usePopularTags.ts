import { Entities } from '@/entity-store/entities.ts';
import { useEntities } from '@/entity-store/hooks/index.ts';
import { useApi } from '@/hooks/useApi.ts';
import { useFeatures } from '@/hooks/useFeatures.ts';
import { type GroupTag, groupTagSchema } from '@/schemas/index.ts';

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