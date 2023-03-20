import { Entities } from 'soapbox/entity-store/entities';
import { useEntities } from 'soapbox/entity-store/hooks';
import { useApi } from 'soapbox/hooks/useApi';
import { accountSchema } from 'soapbox/schemas';

function useGroupMembershipRequests(groupId: string) {
  const api = useApi();

  function authorize(accountId: string) {
    return api.post(`/api/v1/groups/${groupId}/membership_requests/${accountId}/authorize`);
  }

  function reject(accountId: string) {
    return api.post(`/api/v1/groups/${groupId}/membership_requests/${accountId}/reject`);
  }

  const { entities, ...rest } = useEntities(
    [Entities.ACCOUNTS, 'membership_requests', groupId],
    `/api/v1/groups/${groupId}/membership_requests`,
    { schema: accountSchema },
  );

  return {
    accounts: entities,
    authorize,
    reject,
    ...rest,
  };
}

export { useGroupMembershipRequests };