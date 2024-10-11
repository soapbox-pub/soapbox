import { useMemo } from 'react';

import { MastodonClient } from 'soapbox/api/MastodonClient';

import { useAppSelector } from './useAppSelector';
import { useOwnAccount } from './useOwnAccount';

export function useApi(): MastodonClient {
  const { account } = useOwnAccount();
  const authUserUrl = useAppSelector((state) => state.auth.me);
  const accessToken = useAppSelector((state) => account ? state.auth.users.get(account.url)?.access_token : undefined);
  const baseUrl = new URL(account?.url || authUserUrl || location.origin).origin;

  return useMemo(() => {
    return new MastodonClient(baseUrl, accessToken);
  }, [baseUrl, accessToken]);
}