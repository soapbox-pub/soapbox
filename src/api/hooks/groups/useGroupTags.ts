import { Entities } from '@/entity-store/entities.ts';
import { useEntities } from '@/entity-store/hooks/index.ts';
import { useApi } from '@/hooks/useApi.ts';
import { groupTagSchema } from '@/schemas/index.ts';

import type { GroupTag } from '@/schemas/index.ts';

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