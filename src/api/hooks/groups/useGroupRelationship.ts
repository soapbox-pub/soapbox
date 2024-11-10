import { z } from 'zod';

import { Entities } from 'soapbox/entity-store/entities.ts';
import { useEntity } from 'soapbox/entity-store/hooks/index.ts';
import { useApi } from 'soapbox/hooks/useApi.ts';
import { type GroupRelationship, groupRelationshipSchema } from 'soapbox/schemas/index.ts';

function useGroupRelationship(groupId: string | undefined) {
  const api = useApi();

  const { entity: groupRelationship, ...result } = useEntity<GroupRelationship>(
    [Entities.GROUP_RELATIONSHIPS, groupId!],
    () => api.get(`/api/v1/groups/relationships?id[]=${groupId}`),
    {
      enabled: !!groupId,
      schema: z.array(groupRelationshipSchema).nonempty().transform(arr => arr[0]),
    },
  );

  return {
    groupRelationship,
    ...result,
  };
}

export { useGroupRelationship };