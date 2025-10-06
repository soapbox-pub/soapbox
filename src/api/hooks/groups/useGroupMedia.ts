import { Entities } from '@/entity-store/entities.ts';
import { useEntities } from '@/entity-store/hooks/index.ts';
import { useApi } from '@/hooks/useApi.ts';
import { normalizeStatus } from '@/normalizers/index.ts';
import { toSchema } from '@/utils/normalizers.ts';

const statusSchema = toSchema(normalizeStatus);

function useGroupMedia(groupId: string) {
  const api = useApi();

  return useEntities([Entities.STATUSES, 'groupMedia', groupId], () => {
    return api.get(`/api/v1/timelines/group/${groupId}?only_media=true`);
  }, { schema: statusSchema });
}

export { useGroupMedia };