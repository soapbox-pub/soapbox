import { Entities } from 'soapbox/entity-store/entities.ts';
import { useEntities } from 'soapbox/entity-store/hooks/index.ts';
import { useApi } from 'soapbox/hooks/useApi.ts';
import { groupTagSchema } from 'soapbox/schemas/index.ts';

import type { GroupTag } from 'soapbox/schemas/index.ts';

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