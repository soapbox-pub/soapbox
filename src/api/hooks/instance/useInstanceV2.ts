import { useQuery } from '@tanstack/react-query';

import { useApi, useFeatures } from 'soapbox/hooks';
import { Instance, instanceSchema } from 'soapbox/schemas/instance';

/** Get the Instance for the current backend. */
export function useInstanceV2() {
  const api = useApi();
  const features = useFeatures();

  const { data: instance, ...rest } = useQuery<Instance>({
    queryKey: ['instance', api.baseUrl, 'v2'],
    queryFn: async () => {
      const response = await api.get('/api/v2/instance');
      const data = await response.json();
      return instanceSchema.parse(data);
    },
    enabled: features.instanceV2,
  });

  return { instance, ...rest };
}
