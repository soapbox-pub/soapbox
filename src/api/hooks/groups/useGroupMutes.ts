import { Entities } from 'soapbox/entity-store/entities';
import { useEntities } from 'soapbox/entity-store/hooks';
import { useFeatures } from 'soapbox/hooks';
import { useApi } from 'soapbox/hooks/useApi';
import { groupSchema } from 'soapbox/schemas';

import type { Group } from 'soapbox/schemas';

function useGroupMutes() {
  const api = useApi();
  const features = useFeatures();

  const { entities, ...result } = useEntities<Group>(
    [Entities.GROUP_MUTES],
    () => api.get('/api/v1/groups/mutes'),
    { schema: groupSchema, enabled: features.groupsMuting },
  );

  return {
    ...result,
    mutes: entities,
  };
}

export { useGroupMutes };