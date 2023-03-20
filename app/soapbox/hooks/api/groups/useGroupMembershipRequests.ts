import { Entities } from 'soapbox/entity-store/entities';
import { useEntities } from 'soapbox/entity-store/hooks';
import { accountSchema } from 'soapbox/schemas';

function useGroupMembershipRequests(groupId: string) {
  return useEntities(
    [Entities.ACCOUNTS, 'membership_requests', groupId],
    `/api/v1/groups/${groupId}/membership_requests`,
    { schema: accountSchema },
  );
}

export { useGroupMembershipRequests };