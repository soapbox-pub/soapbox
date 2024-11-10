import { Entities } from 'soapbox/entity-store/entities.ts';
import { useDismissEntity, useEntities } from 'soapbox/entity-store/hooks/index.ts';
import { useApi } from 'soapbox/hooks/index.ts';
import { GroupRoles } from 'soapbox/schemas/group-member.ts';
import { accountSchema } from 'soapbox/schemas/index.ts';

import { useGroupRelationship } from './useGroupRelationship.ts';

import type { ExpandedEntitiesPath } from 'soapbox/entity-store/hooks/types.ts';

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