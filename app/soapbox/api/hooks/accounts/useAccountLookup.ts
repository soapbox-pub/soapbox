import { Entities } from 'soapbox/entity-store/entities';
import { useEntityLookup } from 'soapbox/entity-store/hooks';
import { useApi } from 'soapbox/hooks/useApi';
import { type Account, accountSchema } from 'soapbox/schemas';

import { useRelationships } from './useRelationships';

function useAccountLookup(acct?: string) {
  const api = useApi();

  const { entity: account, ...result } = useEntityLookup<Account>(
    Entities.ACCOUNTS,
    (account) => account.acct === acct,
    () => api.get(`/api/v1/accounts/lookup?acct=${acct}`),
    { schema: accountSchema, enabled: !!acct },
  );

  const {
    relationships,
    isLoading: isRelationshipLoading,
  } = useRelationships(account ? [account.id] : []);

  return {
    ...result,
    isLoading: result.isLoading,
    isRelationshipLoading,
    account: account ? { ...account, relationship: relationships[0] || null } : undefined,
  };
}

export { useAccountLookup };