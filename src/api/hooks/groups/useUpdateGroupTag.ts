import { Entities } from 'soapbox/entity-store/entities.ts';
import { useEntityActions } from 'soapbox/entity-store/hooks/index.ts';

import type { GroupTag } from 'soapbox/schemas/index.ts';

function useUpdateGroupTag(groupId: string, tagId: string) {
  const { updateEntity, ...rest } = useEntityActions<GroupTag>(
    [Entities.GROUP_TAGS, groupId, tagId],
    { patch: `/api/v1/groups/${groupId}/tags/${tagId}` },
  );

  return {
    updateGroupTag: updateEntity,
    ...rest,
  };
}

export { useUpdateGroupTag };