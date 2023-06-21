import { Entities } from 'soapbox/entity-store/entities';
import { useEntity } from 'soapbox/entity-store/hooks';
import { useApi } from 'soapbox/hooks/useApi';
import { type Account, accountSchema } from 'soapbox/schemas';

import { useRelationships } from './useRelationships';

function useAccount(accountId?: string) {
  const api = useApi();

  const { entity: account, ...result } = useEntity<Account>(
    [Entities.ACCOUNTS, accountId || ''],
    () => api.get(`/api/v1/accounts/${accountId}`),
    { schema: accountSchema, enabled: !!accountId },
  );
  const {
    relationships,
    isLoading: isRelationshipLoading,
  } = useRelationships(accountId ? [accountId] : []);

  return {
    ...result,
    isLoading: result.isLoading,
    isRelationshipLoading,
    account: account ? { ...account, relationship: relationships[0] || null } : undefined,
  };
}

export { useAccount };