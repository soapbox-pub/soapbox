import { useMutation, useQuery } from '@tanstack/react-query';

import { useApi } from 'soapbox/hooks';
import { queryClient } from 'soapbox/queries/client';
import { relaySchema, type Relay } from 'soapbox/schemas';

import type { AxiosResponse } from 'axios';

const useRelays = () => {
  const api = useApi();

  const getRelays = async () => {
    const { data } = await api.get<{ relays: Relay[] }>('/api/v1/pleroma/admin/relay');

    const normalizedData = data.relays?.map((relay) => relaySchema.parse(relay));
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
    onSuccess: ({ data }: AxiosResponse) =>
      queryClient.setQueryData(['admin', 'relays'], (prevResult: ReadonlyArray<Relay>) =>
        [...prevResult, relaySchema.parse(data)],
      ),
  });

  const {
    mutate: unfollowRelay,
    isPending: isPendingUnfollow,
  } = useMutation({
    mutationFn: (relayUrl: string) => api.delete('/api/v1/pleroma/admin/relays', {
      data: { relay_url: relayUrl },
    }),
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
