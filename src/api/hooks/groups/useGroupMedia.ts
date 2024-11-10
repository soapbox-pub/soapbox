import { Entities } from 'soapbox/entity-store/entities.ts';
import { useEntities } from 'soapbox/entity-store/hooks/index.ts';
import { useApi } from 'soapbox/hooks/useApi.ts';
import { normalizeStatus } from 'soapbox/normalizers/index.ts';
import { toSchema } from 'soapbox/utils/normalizers.ts';

const statusSchema = toSchema(normalizeStatus);

function useGroupMedia(groupId: string) {
  const api = useApi();

  return useEntities([Entities.STATUSES, 'groupMedia', groupId], () => {
    return api.get(`/api/v1/timelines/group/${groupId}?only_media=true`);
  }, { schema: statusSchema });
}

export { useGroupMedia };