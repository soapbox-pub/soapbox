import { Entities } from 'soapbox/entity-store/entities';
import { useEntities } from 'soapbox/entity-store/hooks';
import { useApi } from 'soapbox/hooks';
import { adminAccountSchema } from 'soapbox/schemas/admin-account';

type Filter = 'local' | 'remote' | 'active' | 'pending' | 'disabled' | 'silenced' | 'suspended' | 'sensitized';

/** https://docs.joinmastodon.org/methods/admin/accounts/#v1 */
export function useAdminAccounts(filters: Filter[] = [], limit?: number) {
  const api = useApi();

  const searchParams = new URLSearchParams();

  for (const filter of filters) {
    searchParams.append(filter, 'true');
  }

  if (typeof limit === 'number') {
    searchParams.append('limit', limit.toString());
  }

  const { entities, ...rest } = useEntities(
    [Entities.ACCOUNTS, searchParams.toString()],
    () => api.get('/api/v1/admin/accounts', { searchParams }),
    { schema: adminAccountSchema.transform(({ account }) => account) },
  );

  return { accounts: entities, ...rest };
}