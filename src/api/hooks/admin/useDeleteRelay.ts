import { Entities } from 'soapbox/entity-store/entities';
import { useDeleteEntity } from 'soapbox/entity-store/hooks';
import { useApi } from 'soapbox/hooks';

const useDeleteRelay = () => {
  const api = useApi();

  const { deleteEntity, ...rest } = useDeleteEntity(Entities.RELAYS, (relayUrl: string) =>
    api.delete('/api/v1/pleroma/admin/relay', {
      data: { relay_url: relayUrl },
    }));

  return {
    mutate: deleteEntity,
    ...rest,
  };
};

export { useDeleteRelay };
