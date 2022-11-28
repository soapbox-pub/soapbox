import { useCallback } from 'react';

import { useAppSelector } from 'soapbox/hooks';
import { makeGetAccount } from 'soapbox/selectors';

import type { Account } from 'soapbox/types/entities';

/** Get the logged-in account from the store, if any. */
export const useOwnAccount = (): Account | null => {
  const getAccount = useCallback(makeGetAccount(), []);

  return useAppSelector((state) =>  {
    const { me } = state;

    if (typeof me === 'string') {
      return getAccount(state, me);
    } else {
      return null;
    }
  });
};
