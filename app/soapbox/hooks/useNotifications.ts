import { useEntities } from 'soapbox/entity-store/hooks';
import { normalizeNotification } from 'soapbox/normalizers';

import type { Notification } from 'soapbox/types/entities';

function useNotifications() {
  const result = useEntities<Notification>(['Notification', ''], '/api/v1/notifications');

  return {
    ...result,
    // TODO: handle this in the reducer by passing config.
    entities: result.entities.map(normalizeNotification),
  };
}

export {
  useNotifications,
};