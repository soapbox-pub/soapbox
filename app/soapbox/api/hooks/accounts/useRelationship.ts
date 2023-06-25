import { z } from 'zod';

import { Entities } from 'soapbox/entity-store/entities';
import { useEntity } from 'soapbox/entity-store/hooks';
import { useApi } from 'soapbox/hooks';
import { type Relationship, relationshipSchema } from 'soapbox/schemas';

interface UseRelationshipOpts {
  enabled?: boolean
}

function useRelationship(accountId: string | undefined, opts: UseRelationshipOpts = {}) {
  const api = useApi();
  const { enabled = false } = opts;

  const { entity: relationship, ...result } = useEntity<Relationship>(
    [Entities.RELATIONSHIPS, accountId!],
    () => api.get(`/api/v1/accounts/relationships?id[]=${accountId}`),
    {
      enabled: enabled && !!accountId,
      schema: z.array(relationshipSchema).nonempty().transform(arr => arr[0]),
    },
  );

  return { relationship, ...result };
}

export { useRelationship };