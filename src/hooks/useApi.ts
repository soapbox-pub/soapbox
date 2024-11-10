import { useMemo } from 'react';

import { MastodonClient } from 'soapbox/api/MastodonClient.ts';
import * as BuildConfig from 'soapbox/build-config.ts';

import { useAppSelector } from './useAppSelector.ts';
import { useOwnAccount } from './useOwnAccount.ts';

export function useApi(): MastodonClient {
  const { account } = useOwnAccount();
  const authUserUrl = useAppSelector((state) => state.auth.me);
  const accessToken = useAppSelector((state) => account ? state.auth.users[account.url]?.access_token : undefined);
  const baseUrl = new URL(BuildConfig.BACKEND_URL || account?.url || authUserUrl || location.origin).origin;

  return useMemo(() => {
    return new MastodonClient(baseUrl, accessToken);
  }, [baseUrl, accessToken]);
}