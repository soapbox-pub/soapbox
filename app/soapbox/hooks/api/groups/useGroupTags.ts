import { Entities } from 'soapbox/entity-store/entities';
import { useEntities } from 'soapbox/entity-store/hooks';
import { groupTagSchema } from 'soapbox/schemas';

import type { GroupTag } from 'soapbox/schemas';

function useGroupTags(groupId: string) {
  const { entities, ...result } = useEntities<GroupTag>(
    [Entities.GROUP_TAGS, groupId],
    '/api/mock/groups/tags', // `api/v1/groups/${groupId}/tags`
    { schema: groupTagSchema },
  );

  return {
    ...result,
    tags: entities,
  };
}

export { useGroupTags };