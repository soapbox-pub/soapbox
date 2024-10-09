import ky, { KyInstance } from 'ky';

import { useAppSelector } from './useAppSelector';
import { useOwnAccount } from './useOwnAccount';

export function useClient(): KyInstance {
  const { account } = useOwnAccount();
  const accessToken = useAppSelector((state) => account ? state.auth.users.get(account.url)?.access_token : undefined);

  const headers: Record<string, string> = {};

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return ky.create({
    prefixUrl: account ? new URL(account.url).origin : undefined,
    headers,
  });
}