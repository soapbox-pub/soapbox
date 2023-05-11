import { useEffect } from 'react';
import { z } from 'zod';

import { fetchGroupRelationshipsSuccess } from 'soapbox/actions/groups';
import { Entities } from 'soapbox/entity-store/entities';
import { useEntity } from 'soapbox/entity-store/hooks';
import { useApi, useAppDispatch } from 'soapbox/hooks';
import { type GroupRelationship, groupRelationshipSchema } from 'soapbox/schemas';

function useGroupRelationship(groupId: string | undefined) {
  const api = useApi();
  const dispatch = useAppDispatch();

  const { entity: groupRelationship, ...result } = useEntity<GroupRelationship>(
    [Entities.GROUP_RELATIONSHIPS, groupId as string],
    () => api.get(`/api/v1/groups/relationships?id[]=${groupId}`),
    {
      enabled: !!groupId,
      schema: z.array(groupRelationshipSchema).transform(arr => arr[0]),
    },
  );

  useEffect(() => {
    if (groupRelationship?.id) {
      dispatch(fetchGroupRelationshipsSuccess([groupRelationship]));
    }
  }, [groupRelationship?.id]);

  return {
    entity: groupRelationship,
    ...result,
  };
}

export { useGroupRelationship };