import { useQuery } from '@tanstack/react-query';

import { useApi } from 'soapbox/hooks';
import { InstanceV2, instanceV2Schema } from 'soapbox/schemas/instance';

/** Get the Instance for the current backend. */
export function useInstanceV2() {
  const api = useApi();

  const { data: instance, ...rest } = useQuery<InstanceV2>({
    queryKey: ['instance', api.baseUrl, 'v2'],
    queryFn: async () => {
      const response = await api.get('/api/v2/instance');
      const data = await response.json();
      return instanceV2Schema.parse(data);
    },
  });

  return { instance, ...rest };
}
