import { useEffect } from 'react';

import { fetchRelationships } from 'soapbox/actions/accounts';
import { importFetchedAccounts } from 'soapbox/actions/importer';
import { Entities } from 'soapbox/entity-store/entities';
import { useEntities } from 'soapbox/entity-store/hooks';
import { useAppDispatch } from 'soapbox/hooks';
import { useApi } from 'soapbox/hooks/useApi';
import { accountSchema } from 'soapbox/schemas';

import type { Account } from 'soapbox/schemas';

function useMutes() {
  const api = useApi();
  const dispatch = useAppDispatch();

  const { entities, ...result } = useEntities<Account>(
    [Entities.ACCOUNT_MUTES],
    () => api.get('/api/v1/mutes'),
    { schema: accountSchema },
  );

  useEffect(() => {
    if (entities.length > 0) {
      dispatch(importFetchedAccounts(entities as any));
      dispatch(fetchRelationships(entities.map((item) => item.id)));
    }
  }, [entities.length]);

  return {
    ...result,
    mutes: entities,
  };
}

export { useMutes };