import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { useApi } from 'soapbox/hooks';

const relayEntitySchema = z.object({
  url: z.string().url(),
  marker: z.enum(['read', 'write']).optional(),
});

export function useAdminNostrRelays() {
  const api = useApi();

  return useQuery({
    queryKey: ['NostrRelay'],
    queryFn: async () => {
      const { data } = await api.get('/api/v1/admin/ditto/relays');
      return relayEntitySchema.array().parse(data);
    },
  });
}