import { MastodonClient } from 'soapbox/api/MastodonClient';

import { useAppSelector } from './useAppSelector';
import { useOwnAccount } from './useOwnAccount';

export function useApi(): MastodonClient {
  const { account } = useOwnAccount();
  const accessToken = useAppSelector((state) => account ? state.auth.users.get(account.url)?.access_token : undefined);
  const baseUrl = account ? new URL(account.url).origin : location.origin;

  return new MastodonClient(baseUrl, accessToken);
}