import { useQuery } from '@tanstack/react-query';

import { useApi } from 'soapbox/hooks';
import { InstanceV1, instanceV1Schema } from 'soapbox/schemas/instance';

/** Get the Instance for the current backend. */
export function useInstanceV1() {
  const api = useApi();

  const { data: instance, ...rest } = useQuery<InstanceV1>({
    queryKey: ['instance', api.baseUrl, 'v1'],
    queryFn: async () => {
      const response = await api.get('/api/v1/instance');
      const data = await response.json();
      return instanceV1Schema.parse(data);
    },
  });

  return { instance, ...rest };
}
