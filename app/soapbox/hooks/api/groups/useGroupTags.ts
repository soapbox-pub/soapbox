import { Entities } from 'soapbox/entity-store/entities';
import { useEntities } from 'soapbox/entity-store/hooks';
import { useApi } from 'soapbox/hooks/useApi';
import { groupTagSchema } from 'soapbox/schemas';

import type { GroupTag } from 'soapbox/schemas';

function useGroupTags(groupId: string) {
  const api = useApi();

  const { entities, ...result } = useEntities<GroupTag>(
    [Entities.GROUP_TAGS, groupId],
    () => api.get(`/api/v1/truth/trends/groups/${groupId}/tags`),
    { schema: groupTagSchema },
  );

  return {
    ...result,
    tags: entities,
  };
}

export { useGroupTags };