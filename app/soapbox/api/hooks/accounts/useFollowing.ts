import { Entities } from 'soapbox/entity-store/entities';
import { useEntities } from 'soapbox/entity-store/hooks';
import { useApi } from 'soapbox/hooks';
import { Account, accountSchema } from 'soapbox/schemas';

import { useRelationships } from './useRelationships';

function useFollowing(accountId: string | undefined) {
  const api = useApi();

  const { entities, ...rest } = useEntities(
    [Entities.ACCOUNTS, accountId!, 'following'],
    () => api.get(`/api/v1/accounts/${accountId}/following`),
    { schema: accountSchema, enabled: !!accountId },
  );

  const { relationships } = useRelationships(
    [accountId!, 'following'],
    entities.map(({ id }) => id),
  );

  const accounts: Account[] = entities.map((account) => ({
    ...account,
    relationship: relationships[account.id],
  }));

  return { accounts, ...rest };
}

export { useFollowing };