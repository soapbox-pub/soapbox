import { Entities } from 'soapbox/entity-store/entities.ts';
import { useEntities } from 'soapbox/entity-store/hooks/index.ts';
import { useFeatures } from 'soapbox/hooks/index.ts';
import { useApi } from 'soapbox/hooks/useApi.ts';
import { groupSchema } from 'soapbox/schemas/index.ts';

import type { Group } from 'soapbox/schemas/index.ts';

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