import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { useApi } from 'soapbox/hooks/useApi.ts';
import { PolicyItem, PolicyResponse, PolicySpec } from 'soapbox/utils/policies.ts';

const useModerationPolicies = () => {
  const api = useApi();
  const queryClient = useQueryClient();

  const allPoliciesQuery = useQuery({
    queryKey: ['admin', 'moderation_policies'],
    queryFn: async () => {
      const response = await api.get('/api/v1/admin/ditto/policies');
      return response.json() as Promise<PolicyItem[]>;
    },
  });

  // Fetch current policy
  const currentPolicyQuery = useQuery({
    queryKey: ['admin', 'current_moderation_policy'],
    queryFn: async () => {
      const response = await api.get('/api/v1/admin/ditto/policies/current');
      return response.json() as Promise<PolicyResponse>;
    },
  });

  // Update current policy
  const updatePolicyMutation = useMutation({
    mutationFn: async (spec: PolicySpec) => {
      const response = await api.put('/api/v1/admin/ditto/policies/current', spec);

      // Parse the JSON response
      const data = await response.json();

      // Check if the response contains an error
      if (data && 'error' in data) {
        // Throw the error to be caught by the caller
        throw new Error(data.error);
      }

      return data;
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
  };
};

export { useModerationPolicies };
