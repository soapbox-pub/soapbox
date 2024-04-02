import { useQuery } from '@tanstack/react-query';

import { useApi } from 'soapbox/hooks';
import { relaySchema, type Relay } from 'soapbox/schemas';

const useRelays = () => {
  const api = useApi();

  const getRelays = async () => {
    const { data } = await api.get<{ relays: Relay[] }>('/api/v1/pleroma/admin/relay');

    const normalizedData = data.relays?.map((relay) => relaySchema.parse(relay));
    return normalizedData;
  };

  const result = useQuery<ReadonlyArray<Relay>>({
    queryKey: ['relays'],
    queryFn: getRelays,
    placeholderData: [],
  });

  return result;
};

export { useRelays };
