import { Entities } from 'soapbox/entity-store/entities';
import { useEntityActions } from 'soapbox/entity-store/hooks';

import type { GroupTag } from 'soapbox/schemas';

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