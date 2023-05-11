import { Entities } from 'soapbox/entity-store/entities';
import { useEntities } from 'soapbox/entity-store/hooks';
import { statusSchema } from 'soapbox/schemas';

import { useApi } from '../../../hooks/useApi';

/** TruthSocial ancestors hook. */
function useStatusAncestors(statusId: string) {
  const api = useApi();

  const { entities, ...result } = useEntities(
    [Entities.STATUSES, 'ancestors', statusId],
    () => api.get(`/api/v2/statuses/${statusId}/context/ancestors`),
    { schema: statusSchema },
  );

  return {
    ...result,
    statuses: entities,
  };
}

export { useStatusAncestors };