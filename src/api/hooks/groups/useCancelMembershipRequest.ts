import { Entities } from 'soapbox/entity-store/entities.ts';
import { useCreateEntity } from 'soapbox/entity-store/hooks/index.ts';
import { useApi, useOwnAccount } from 'soapbox/hooks/index.ts';

import type { Group } from 'soapbox/schemas/index.ts';

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
