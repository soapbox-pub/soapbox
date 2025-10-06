import { Entities } from '@/entity-store/entities.ts';
import { useCreateEntity } from '@/entity-store/hooks/index.ts';
import { useApi } from '@/hooks/useApi.ts';
import { useOwnAccount } from '@/hooks/useOwnAccount.ts';

import type { Group } from '@/schemas/index.ts';

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
