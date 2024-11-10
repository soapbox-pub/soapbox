import { Entities } from 'soapbox/entity-store/entities.ts';
import { useEntities } from 'soapbox/entity-store/hooks/index.ts';
import { useApi } from 'soapbox/hooks/index.ts';
import { adminAccountSchema } from 'soapbox/schemas/admin-account.ts';

interface MastodonAdminFilters {
  local?: boolean;
  remote?: boolean;
  active?: boolean;
  pending?: boolean;
  disabled?: boolean;
  silenced?: boolean;
  suspended?: boolean;
  sensitized?: boolean;
}

/** https://docs.joinmastodon.org/methods/admin/accounts/#v1 */
export function useAdminAccounts(filters: MastodonAdminFilters, limit?: number) {
  const api = useApi();

  const searchParams = new URLSearchParams();

  for (const [name, value] of Object.entries(filters)) {
    searchParams.append(name, value.toString());
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