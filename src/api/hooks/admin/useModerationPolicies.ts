import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { MastodonResponse } from 'soapbox/api/MastodonResponse.ts';
import { useApi } from 'soapbox/hooks/useApi.ts';
import { PolicyItem, PolicyResponse, PolicySpec } from 'soapbox/utils/policies.ts';

const useModerationPolicies = () => {
  const api = useApi();
  const queryClient = useQueryClient();

  const handleResponse = async (response: MastodonResponse, message: string) => {
    if (!response.ok) {
      const details = await response.error()
        .then(v => v?.error || 'Unknown error');
      throw new Error(`${message}: ${details}`);
    }

    const data = await response.json();
    // Check if the response contains an error
    if (data && 'error' in data) throw new Error(data.error);
    return data;
  };


  const allPoliciesQuery = useQuery({
    queryKey: ['admin', 'moderation_policies'],
    queryFn: async () => {
      return await handleResponse(
        await api.get('/api/v1/admin/ditto/policies'),
        'Error fetching policy list',
      ) as Promise<PolicyItem[]>;
    },
  });

  // Fetch current policy
  const currentPolicyQuery = useQuery({
    queryKey: ['admin', 'current_moderation_policy'],
    queryFn: async () => {
      return await handleResponse(
        await api.get('/api/v1/admin/ditto/policies/current'),
        'Error fetching current policy',
      ) as Promise<PolicyResponse>;
    },
  });

  // Update current policy
  const updatePolicyMutation = useMutation({
    mutationFn: async (spec: PolicySpec) => {
      return await handleResponse(
        await api.put('/api/v1/admin/ditto/policies/current', spec),
        'Error updating policy',
      ) as Promise<PolicyResponse>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'current_moderation_policy'] }); // Refetch after update
    },
  });

  return {
    allPolicies: allPoliciesQuery.data,
    storedPolicies: currentPolicyQuery.data,
    isLoading: allPoliciesQuery.isLoading || currentPolicyQuery.isLoading,
    isFetched: currentPolicyQuery.isFetched,
    updatePolicy: updatePolicyMutation.mutate,
    isUpdating: updatePolicyMutation.isPending,
    allPoliciesError: allPoliciesQuery.error,
    storedPoliciesError: currentPolicyQuery.error,
    allPoliciesIsError: allPoliciesQuery.isError,
    storedPoliciesIsError: currentPolicyQuery.isError,
  };
};

export { useModerationPolicies };
