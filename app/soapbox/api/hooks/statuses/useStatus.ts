import { Entities } from 'soapbox/entity-store/entities';
import { useEntity } from 'soapbox/entity-store/hooks';
import { useApi } from 'soapbox/hooks/useApi';
import { type Status, statusSchema } from 'soapbox/schemas';

function useStatus(statusId: string | undefined) {
  const api = useApi();

  const { entity: status, ...rest } = useEntity<Status>(
    [Entities.STATUSES, statusId!],
    () => api.get(`/api/v1/statuses/${statusId}`),
    { schema: statusSchema, enabled: !!statusId },
  );

  return { status, ...rest };
}

export { useStatus };