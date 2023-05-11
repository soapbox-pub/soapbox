import { Entities } from 'soapbox/entity-store/entities';
import { useEntity } from 'soapbox/entity-store/hooks';
import { statusSchema } from 'soapbox/schemas';

import { useApi } from '../../../hooks/useApi';

function useStatus(statusId: string) {
  const api = useApi();

  const { entity, ...result } = useEntity(
    [Entities.STATUSES, statusId],
    () => api.get(`/api/v1/statuses/${statusId}`),
    { schema: statusSchema },
  );

  return {
    ...result,
    status: entity,
  };
}

export { useStatus };