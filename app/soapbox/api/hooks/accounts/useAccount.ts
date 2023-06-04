import { Entities } from 'soapbox/entity-store/entities';
import { useEntity } from 'soapbox/entity-store/hooks';
import { useApi } from 'soapbox/hooks/useApi';
import { type Account, accountSchema } from 'soapbox/schemas';


import { useRelationships } from './useRelationships';

function useAccount(id: string) {
  const api = useApi();

  const { entity: account, ...result } = useEntity<Account>(
    [Entities.ACCOUNTS, id],
    () => api.get(`/api/v1/accounts/${id}`),
    { schema: accountSchema },
  );
  const { relationships, isLoading } = useRelationships([account?.id as string]);

  return {
    ...result,
    isLoading: result.isLoading || isLoading,
    account: account ? { ...account, relationship: relationships[0] || null } : undefined,
  };
}

export { useAccount };