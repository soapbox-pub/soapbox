import { Entities } from 'soapbox/entity-store/entities';
import { useDismissEntity, useEntities } from 'soapbox/entity-store/hooks';
import { useApi } from 'soapbox/hooks/useApi';
import { accountSchema } from 'soapbox/schemas';
import { GroupRoles } from 'soapbox/schemas/group-member';

import { useGroupRelationship } from './useGroupRelationship';

import type { ExpandedEntitiesPath } from 'soapbox/entity-store/hooks/types';

function useGroupMembershipRequests(groupId: string) {
  const api = useApi();
  const path: ExpandedEntitiesPath = [Entities.ACCOUNTS, 'membership_requests', groupId];

  const { groupRelationship: relationship } = useGroupRelationship(groupId);

  const { entities, invalidate, fetchEntities, ...rest } = useEntities(
    path,
    () => api.get(`/api/v1/groups/${groupId}/membership_requests`),
    {
      schema: accountSchema,
      enabled: relationship?.role === GroupRoles.OWNER || relationship?.role === GroupRoles.ADMIN,
    },
  );

  const { dismissEntity: authorize } = useDismissEntity(path, async (accountId: string) => {
    const response = await api.post(`/api/v1/groups/${groupId}/membership_requests/${accountId}/authorize`);
    invalidate();
    return response;
  });

  const { dismissEntity: reject } = useDismissEntity(path, async (accountId: string) => {
    const response = await api.post(`/api/v1/groups/${groupId}/membership_requests/${accountId}/reject`);
    invalidate();
    return response;
  });

  return {
    accounts: entities,
    refetch: fetchEntities,
    authorize,
    reject,
    ...rest,
  };
}

export { useGroupMembershipRequests };