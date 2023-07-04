import { Entities } from 'soapbox/entity-store/entities';
import { useCreateEntity } from 'soapbox/entity-store/hooks';
import { useApi, useOwnAccount } from 'soapbox/hooks';

import type { Group } from 'soapbox/schemas';

function useCancelMembershipRequest(group: Group) {
  const api = useApi();
  const { account: me } = useOwnAccount();

  const { createEntity, isSubmitting } = useCreateEntity(
    [Entities.GROUP_RELATIONSHIPS],
    () => api.post(`/api/v1/groups/${group.id}/membership_requests/${me?.id}/reject`),
  );

  return {
    mutate: createEntity,
    isSubmitting,
  };
}

export { useCancelMembershipRequest };
