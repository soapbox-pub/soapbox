import { Entities } from 'soapbox/entity-store/entities';
import { useDismissEntity, useEntities } from 'soapbox/entity-store/hooks';
import { useApi } from 'soapbox/hooks/useApi';
import { accountSchema } from 'soapbox/schemas';

import type { ExpandedEntitiesPath } from 'soapbox/entity-store/hooks/types';

function useGroupMembershipRequests(groupId: string) {
  const api = useApi();
  const path: ExpandedEntitiesPath = [Entities.ACCOUNTS, 'membership_requests', groupId];

  const authorize = useDismissEntity(path, (accountId) => {
    return api.post(`/api/v1/groups/${groupId}/membership_requests/${accountId}/authorize`);
  });

  const reject = useDismissEntity(path, (accountId) => {
    return api.post(`/api/v1/groups/${groupId}/membership_requests/${accountId}/reject`);
  });

  const { entities, ...rest } = useEntities(
    path,
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