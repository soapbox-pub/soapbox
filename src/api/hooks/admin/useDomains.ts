import { useQuery } from '@tanstack/react-query';

import { useApi } from 'soapbox/hooks';
import { domainSchema, type Domain } from 'soapbox/schemas';

const useDomains = () => {
  const api = useApi();

  const getDomains = async () => {
    const { data } = await api.get<Domain[]>('/api/v1/pleroma/admin/domains');

    const normalizedData = data.map((domain) => domainSchema.parse(domain));
    return normalizedData;
  };

  const result = useQuery<ReadonlyArray<Domain>>({
    queryKey: ['domains'],
    queryFn: getDomains,
    placeholderData: [],
  });

  return result;
};

export { useDomains };
