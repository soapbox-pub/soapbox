import { Entities } from 'soapbox/entity-store/entities';
import { useEntities } from 'soapbox/entity-store/hooks';
import { statusSchema } from 'soapbox/schemas';

import { useApi } from '../../../hooks/useApi';

/** TruthSocial descendants hook. */
function useStatusDescendants(statusId: string) {
  const api = useApi();

  const { entities, ...result } = useEntities(
    [Entities.STATUSES, 'descendants', statusId],
    () => api.get(`/api/v2/statuses/${statusId}/context/descendants`),
    { schema: statusSchema },
  );

  return {
    ...result,
    statuses: entities,
  };
}

export { useStatusDescendants };