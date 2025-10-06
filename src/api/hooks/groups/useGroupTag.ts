import { Entities } from '@/entity-store/entities.ts';
import { useEntity } from '@/entity-store/hooks/index.ts';
import { useApi } from '@/hooks/useApi.ts';
import { type GroupTag, groupTagSchema } from '@/schemas/index.ts';

function useGroupTag(tagId: string) {
  const api = useApi();

  const { entity: tag, ...result } = useEntity<GroupTag>(
    [Entities.GROUP_TAGS, tagId],
    () => api.get(`/api/v1/tags/${tagId }`),
    { schema: groupTagSchema },
  );

  return {
    ...result,
    tag,
  };
}

export { useGroupTag };