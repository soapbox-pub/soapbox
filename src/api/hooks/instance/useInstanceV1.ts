import { useQuery } from '@tanstack/react-query';

import { useApi } from 'soapbox/hooks/useApi.ts';
import { InstanceV1, instanceV1Schema } from 'soapbox/schemas/instance.ts';

interface Opts {
  /** The base URL of the instance. */
  baseUrl?: string;
  enabled?: boolean;
  retryOnMount?: boolean;
  staleTime?: number;
}

/** Get the Instance for the current backend. */
export function useInstanceV1(opts: Opts = {}) {
  const api = useApi();

  const { baseUrl } = opts;

  const { data: instance, ...rest } = useQuery<InstanceV1>({
    queryKey: ['instance', baseUrl ?? api.baseUrl, 'v1'],
    queryFn: async () => {
      const response = await api.get('/api/v1/instance');
      const data = await response.json();
      return instanceV1Schema.parse(data);
    },
    ...opts,
  });

  return { instance, ...rest };
}
