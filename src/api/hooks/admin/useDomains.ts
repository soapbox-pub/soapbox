import { useMutation, useQuery } from '@tanstack/react-query';

import { useApi } from 'soapbox/hooks';
import { queryClient } from 'soapbox/queries/client';
import { domainSchema, type Domain } from 'soapbox/schemas';

interface CreateDomainParams {
  domain: string;
  public: boolean;
}

interface UpdateDomainParams {
  id: string;
  public: boolean;
}

const useDomains = () => {
  const api = useApi();

  const getDomains = async () => {
    const response = await api.get('/api/v1/pleroma/admin/domains');
    const data: Domain[] = await response.json();

    const normalizedData = data.map((domain) => domainSchema.parse(domain));
    return normalizedData;
  };

  const result = useQuery<ReadonlyArray<Domain>>({
    queryKey: ['admin', 'domains'],
    queryFn: getDomains,
    placeholderData: [],
  });

  const {
    mutate: createDomain,
    isPending: isCreating,
  } = useMutation({
    mutationFn: (params: CreateDomainParams) => api.post('/api/v1/pleroma/admin/domains', params),
    retry: false,
    onSuccess: async (response: Response) => {
      const data = await response.json();
      return queryClient.setQueryData(['admin', 'domains'], (prevResult: ReadonlyArray<Domain>) =>
        [...prevResult, domainSchema.parse(data)],
      );
    },
  });

  const {
    mutate: updateDomain,
    isPending: isUpdating,
  } = useMutation({
    mutationFn: ({ id, ...params }: UpdateDomainParams) => api.patch(`/api/v1/pleroma/admin/domains/${id}`, params),
    retry: false,
    onSuccess: async (response: Response) => {
      const data = await response.json();
      return queryClient.setQueryData(['admin', 'domains'], (prevResult: ReadonlyArray<Domain>) =>
        prevResult.map((domain) => domain.id === data.id ? domainSchema.parse(data) : domain),
      );
    },
  });

  const {
    mutate: deleteDomain,
    isPending: isDeleting,
  } = useMutation({
    mutationFn: (id: string) => api.delete(`/api/v1/pleroma/admin/domains/${id}`),
    retry: false,
    onSuccess: (_, id) =>
      queryClient.setQueryData(['admin', 'domains'], (prevResult: ReadonlyArray<Domain>) =>
        prevResult.filter(({ id: domainId }) => domainId !== id),
      ),
  });

  return {
    ...result,
    createDomain,
    isCreating,
    updateDomain,
    isUpdating,
    deleteDomain,
    isDeleting,
  };
};

export { useDomains };
