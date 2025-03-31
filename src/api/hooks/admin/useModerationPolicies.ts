import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { useApi } from 'soapbox/hooks/useApi.ts';

type FieldType = 'string' | 'multi_string' | 'number' | 'multi_number' | 'boolean' | 'unknown';

export interface FieldItem {
  type: FieldType;
  description?: string;
  optional?: boolean;
  default?: any;
}

interface PolicyItem {
  internalName: string;
  name: string;
  description?: string;
  parameters: Record<string, FieldItem>;
}

interface PolicySpecItem {
  name: string;
  params?: Record<string, ParamValue | ParamValue[]>;
}

interface PolicySpec {
  policies: PolicySpecItem[];
}


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
      return response.json() as Promise<PolicySpec>;
    },
  });

  // Update current policy
  const updatePolicyMutation = useMutation({
    mutationFn: async (spec: PolicySpec) => {
      const response = await api.put('/api/v1/admin/ditto/policies/current', { json: spec });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'current_moderation_policy']); // Refetch after update
    },
  });

  return {
    allPolicies: allPoliciesQuery.data,
    currentPolicy: currentPolicyQuery.data,
    isLoading: allPoliciesQuery.isLoading || currentPolicyQuery.isLoading,
    updatePolicy: updatePolicyMutation.mutate,
    isUpdating: updatePolicyMutation.isPending,
  };
};

export { useModerationPolicies };
