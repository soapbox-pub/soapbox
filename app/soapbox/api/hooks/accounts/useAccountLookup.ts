import { Entities } from 'soapbox/entity-store/entities';
import { useEntityLookup } from 'soapbox/entity-store/hooks';
import { useApi } from 'soapbox/hooks/useApi';
import { type Account, accountSchema } from 'soapbox/schemas';

import { useRelationship } from './useRelationship';

interface UseAccountLookupOpts {
  withRelationship?: boolean
}

function useAccountLookup(acct: string | undefined, opts: UseAccountLookupOpts = {}) {
  const api = useApi();
  const { withRelationship } = opts;

  const { entity: account, ...result } = useEntityLookup<Account>(
    Entities.ACCOUNTS,
    (account) => account.acct === acct,
    () => api.get(`/api/v1/accounts/lookup?acct=${acct}`),
    { schema: accountSchema, enabled: !!acct },
  );

  const {
    relationship,
    isLoading: isRelationshipLoading,
  } = useRelationship(account?.id, { enabled: withRelationship });

  return {
    ...result,
    isLoading: result.isLoading,
    isRelationshipLoading,
    account: account ? { ...account, relationship } : undefined,
  };
}

export { useAccountLookup };