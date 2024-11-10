import { useEffect, useMemo } from 'react';
import { useHistory } from 'react-router-dom';

import { Entities } from 'soapbox/entity-store/entities.ts';
import { useEntity } from 'soapbox/entity-store/hooks/index.ts';
import { useApi } from 'soapbox/hooks/useApi.ts';
import { useFeatures } from 'soapbox/hooks/useFeatures.ts';
import { useLoggedIn } from 'soapbox/hooks/useLoggedIn.ts';
import { type Account, accountSchema } from 'soapbox/schemas/index.ts';

import { useRelationship } from './useRelationship.ts';

interface UseAccountOpts {
  withRelationship?: boolean;
}

function useAccount(accountId?: string, opts: UseAccountOpts = {}) {
  const api = useApi();
  const history = useHistory();
  const features = useFeatures();
  const { me } = useLoggedIn();
  const { withRelationship } = opts;

  const { entity, isUnauthorized, ...result } = useEntity<Account>(
    [Entities.ACCOUNTS, accountId!],
    () => api.get(`/api/v1/accounts/${accountId}`),
    { schema: accountSchema, enabled: !!accountId },
  );

  const {
    relationship,
    isLoading: isRelationshipLoading,
  } = useRelationship(accountId, { enabled: withRelationship });

  const isBlocked = relationship?.blocked_by === true;
  const isUnavailable = (me === entity?.id) ? false : (isBlocked && !features.blockersVisible);

  const account = useMemo(
    () => entity ? { ...entity, relationship } : undefined,
    [entity, relationship],
  );

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
    account,
  };
}

export { useAccount };