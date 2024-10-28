import { Entities } from 'soapbox/entity-store/entities';
import { useEntities } from 'soapbox/entity-store/hooks';
import { useApi } from 'soapbox/hooks';
import { adminAccountSchema } from 'soapbox/schemas/admin-account';

const allFilters = new Set([
  'local' as const,
  'remote' as const,
  'active' as const,
  'pending' as const,
  'disabled' as const,
  'silenced' as const,
  'suspended' as const,
  'sensitized' as const,
]);

/** https://docs.joinmastodon.org/methods/admin/accounts/#v1 */
export function useAdminAccounts(filters: typeof allFilters, limit?: number) {
  const api = useApi();

  const searchParams = new URLSearchParams();

  for (const filter of allFilters) {
    if (filters.has(filter)) {
      searchParams.append(filter, 'true');
    } else {
      searchParams.append(filter, 'false');
    }
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