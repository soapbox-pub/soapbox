import { Entities } from 'soapbox/entity-store/entities';
import { useEntities } from 'soapbox/entity-store/hooks';
import { useApi, useFeatures, useOwnAccount } from 'soapbox/hooks';
import { Group, groupSchema } from 'soapbox/schemas';

function usePendingGroups() {
  const api = useApi();
  const { account } = useOwnAccount();
  const features = useFeatures();

  const { entities, ...result } = useEntities<Group>(
    [Entities.GROUPS, account?.id as string, 'pending'],
    () => api.get('/api/v1/groups', {
      params: {
        pending: true,
      },
    }),
    {
      schema: groupSchema,
      enabled: features.groupsPending,
    },
  );

  return {
    ...result,
    groups: entities,
  };
}

export { usePendingGroups };