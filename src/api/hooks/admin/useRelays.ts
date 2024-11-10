import { useMutation, useQuery } from '@tanstack/react-query';

import { useApi } from 'soapbox/hooks/useApi.ts';
import { queryClient } from 'soapbox/queries/client.ts';
import { relaySchema, type Relay } from 'soapbox/schemas/index.ts';

const useRelays = () => {
  const api = useApi();

  const getRelays = async () => {
    const response = await api.get('/api/v1/pleroma/admin/relay');
    const relays: Relay[] = await response.json();

    const normalizedData = relays?.map((relay) => relaySchema.parse(relay));
    return normalizedData;
  };

  const result = useQuery<ReadonlyArray<Relay>>({
    queryKey: ['admin', 'relays'],
    queryFn: getRelays,
    placeholderData: [],
  });

  const {
    mutate: followRelay,
    isPending: isPendingFollow,
  } = useMutation({
    mutationFn: (relayUrl: string) => api.post('/api/v1/pleroma/admin/relays', { relay_url: relayUrl }),
    retry: false,
    onSuccess: async (response: Response) => {
      const data = await response.json();
      return queryClient.setQueryData(['admin', 'relays'], (prevResult: ReadonlyArray<Relay>) =>
        [...prevResult, relaySchema.parse(data)],
      );
    },
  });

  const {
    mutate: unfollowRelay,
    isPending: isPendingUnfollow,
  } = useMutation({
    mutationFn: async (relayUrl: string) => {
      await api.request('DELETE', '/api/v1/pleroma/admin/relays', { relay_url: relayUrl });
    },
    retry: false,
    onSuccess: (_, relayUrl) =>
      queryClient.setQueryData(['admin', 'relays'], (prevResult: ReadonlyArray<Relay>) =>
        prevResult.filter(({ actor }) => actor !== relayUrl),
      ),
  });

  return {
    ...result,
    followRelay,
    isPendingFollow,
    unfollowRelay,
    isPendingUnfollow,
  };
};

export { useRelays };
