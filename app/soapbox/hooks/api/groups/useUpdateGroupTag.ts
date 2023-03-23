import { Entities } from 'soapbox/entity-store/entities';
import { useEntityActions } from 'soapbox/entity-store/hooks';
import { groupTagSchema } from 'soapbox/schemas';

import type { GroupTag } from 'soapbox/schemas';

function useUpdateGroupTag(groupId: string, tagId: string) {
  const { updateEntity } = useEntityActions<GroupTag>(
    [Entities.GROUP_TAGS, groupId, tagId],
    { patch: `/api/mock/truth/groups/${groupId}/tags/${tagId}` },
    { schema: groupTagSchema },
  );

  return updateEntity;
}

export { useUpdateGroupTag };