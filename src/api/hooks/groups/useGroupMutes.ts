import { Entities } from '@/entity-store/entities.ts';
import { useEntities } from '@/entity-store/hooks/index.ts';
import { useApi } from '@/hooks/useApi.ts';
import { useFeatures } from '@/hooks/useFeatures.ts';
import { groupSchema } from '@/schemas/index.ts';

import type { Group } from '@/schemas/index.ts';

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