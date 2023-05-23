import { z } from 'zod';

import { Entities } from 'soapbox/entity-store/entities';
import { useEntity } from 'soapbox/entity-store/hooks';
import { useApi } from 'soapbox/hooks';
import { relationshipSchema } from 'soapbox/schemas';

function useRelationship(accountId: string | undefined) {
  const api = useApi();

  const { entity: relationship, ...result } = useEntity(
    [Entities.RELATIONSHIPS, accountId as string],
    () => api.get(`/api/v1/accounts/relationships?id[]=${accountId}`),
    {
      enabled: !!accountId,
      schema: z.array(relationshipSchema).transform(arr => arr[0]),
    },
  );

  return {
    ...result,
    relationship,
  };
}

export { useRelationship };