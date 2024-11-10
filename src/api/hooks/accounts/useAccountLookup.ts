import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import { Entities } from 'soapbox/entity-store/entities.ts';
import { useEntityLookup } from 'soapbox/entity-store/hooks/index.ts';
import { useApi, useFeatures, useLoggedIn } from 'soapbox/hooks/index.ts';
import { type Account, accountSchema } from 'soapbox/schemas/index.ts';

import { useRelationship } from './useRelationship.ts';

interface UseAccountLookupOpts {
  withRelationship?: boolean;
}

function useAccountLookup(acct: string | undefined, opts: UseAccountLookupOpts = {}) {
  const api = useApi();
  const features = useFeatures();
  const history = useHistory();
  const { me } = useLoggedIn();
  const { withRelationship } = opts;

  const { entity: account, isUnauthorized, ...result } = useEntityLookup<Account>(
    Entities.ACCOUNTS,
    (account) => account.acct.toLowerCase() === acct?.toLowerCase(),
    () => api.get(`/api/v1/accounts/lookup?acct=${acct}`),
    { schema: accountSchema, enabled: !!acct },
  );

  const {
    relationship,
    isLoading: isRelationshipLoading,
  } = useRelationship(account?.id, { enabled: withRelationship });

  const isBlocked = relationship?.blocked_by === true;
  const isUnavailable = (me === account?.id) ? false : (isBlocked && !features.blockersVisible);

  useEffect(() => {
    if (isUnauthorized) {
      history.push('/login');
    }
  }, [isUnauthorized]);

  return {
    ...result,
    isLoading: result.isLoading,
    isRelationshipLoading,
    isUnauthorized,
    isUnavailable,
    account: account ? { ...account, relationship } : undefined,
  };
}

export { useAccountLookup };