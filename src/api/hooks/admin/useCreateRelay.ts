import { Entities } from 'soapbox/entity-store/entities';
import { useCreateEntity } from 'soapbox/entity-store/hooks';
import { useApi } from 'soapbox/hooks';
import { relaySchema } from 'soapbox/schemas';

const useCreateRelay = () => {
  const api = useApi();

  const { createEntity, ...rest } = useCreateEntity([Entities.RELAYS], (relayUrl: string) =>
    api.post('/api/v1/pleroma/admin/relay', { relay_url: relayUrl }), { schema: relaySchema });

  return {
    createRelay: createEntity,
    ...rest,
  };
};

export { useCreateRelay };
