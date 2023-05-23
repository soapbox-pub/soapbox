import { Entities } from 'soapbox/entity-store/entities';
import { useEntityLookup } from 'soapbox/entity-store/hooks';
import { useApi } from 'soapbox/hooks/useApi';
import { accountSchema } from 'soapbox/schemas';

import { useRelationship } from './useRelationship';

function useAccountLookup(acct: string | undefined) {
  const api = useApi();

  const { entity: account, ...result } = useEntityLookup(
    Entities.ACCOUNTS,
    (account) => account.acct === acct,
    () => api.get(`/api/v1/accounts/lookup?name=${acct}`),
    { schema: accountSchema, enabled: !!acct },
  );

  const { relationship } = useRelationship(account?.id);

  return {
    ...result,
    account,
    relationship,
  };
}

export { useAccountLookup };