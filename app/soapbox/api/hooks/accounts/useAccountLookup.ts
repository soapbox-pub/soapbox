import { Entities } from 'soapbox/entity-store/entities';
import { useEntityLookup } from 'soapbox/entity-store/hooks';
import { useFeatures, useLoggedIn } from 'soapbox/hooks';
import { useApi } from 'soapbox/hooks/useApi';
import { type Account, accountSchema } from 'soapbox/schemas';

import { useRelationship } from './useRelationship';

interface UseAccountLookupOpts {
  withRelationship?: boolean
}

function useAccountLookup(acct: string | undefined, opts: UseAccountLookupOpts = {}) {
  const api = useApi();
  const features = useFeatures();
  const { me } = useLoggedIn();
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

  const isBlocked = account?.relationship?.blocked_by === true;
  const isUnavailable = (me === account?.id) ? false : (isBlocked && !features.blockersVisible);

  return {
    ...result,
    isLoading: result.isLoading,
    isRelationshipLoading,
    isUnavailable,
    account: account ? { ...account, relationship } : undefined,
  };
}

export { useAccountLookup };