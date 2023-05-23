import { useAccount } from 'soapbox/api/hooks';
import { useAppSelector } from 'soapbox/hooks';

import type { Account } from 'soapbox/types/entities';

/** Get the logged-in account from the store, if any. */
export const useOwnAccount = (): Account | undefined => {
  const accountId = useAppSelector((state) => state.me || '');
  const { account } = useAccount(accountId);
  return account;
};
