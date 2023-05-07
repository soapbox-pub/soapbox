import { Entities } from 'soapbox/entity-store/entities';
import { useEntity } from 'soapbox/entity-store/hooks';
import { useApi } from 'soapbox/hooks';
import { type GroupTag, groupTagSchema } from 'soapbox/schemas';

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