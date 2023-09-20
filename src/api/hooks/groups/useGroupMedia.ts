import { Entities } from 'soapbox/entity-store/entities';
import { useEntities } from 'soapbox/entity-store/hooks';
import { useApi } from 'soapbox/hooks/useApi';
import { normalizeStatus } from 'soapbox/normalizers';
import { toSchema } from 'soapbox/utils/normalizers';

const statusSchema = toSchema(normalizeStatus);

function useGroupMedia(groupId: string) {
  const api = useApi();

  return useEntities([Entities.STATUSES, 'groupMedia', groupId], () => {
    return api.get(`/api/v1/timelines/group/${groupId}?only_media=true`);
  }, { schema: statusSchema });
}

export { useGroupMedia };