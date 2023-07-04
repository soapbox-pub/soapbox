import { useMutation, useQuery } from '@tanstack/react-query';

import { useApi, useFeatures, useOwnAccount } from 'soapbox/hooks';

import { queryClient } from './client';

export interface IPolicy {
  pending_policy_id: string
}

const PolicyKeys = {
  policy: ['policy'] as const,
};

function usePendingPolicy() {
  const api = useApi();
  const { account } = useOwnAccount();
  const features = useFeatures();

  const getPolicy = async() => {
    const { data } = await api.get<IPolicy>('/api/v1/truth/policies/pending');

    return data;
  };

  return useQuery(PolicyKeys.policy, getPolicy, {
    retry: 3,
    refetchOnWindowFocus: true,
    staleTime: 60000, // 1 minute
    cacheTime: Infinity,
    enabled: !!account && features.truthPolicies,
  });
}

function useAcceptPolicy() {
  const api = useApi();

  return useMutation((
    { policy_id }: { policy_id: string },
  ) => api.patch(`/api/v1/truth/policies/${policy_id}/accept`), {
    onSuccess() {
      queryClient.setQueryData(PolicyKeys.policy, {});
    },
  });
}

export { usePendingPolicy, useAcceptPolicy, PolicyKeys };