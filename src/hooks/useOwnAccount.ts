import { useCallback } from 'react';

import { makeGetAccount } from '@/selectors/index.ts';

import { useAppSelector } from './useAppSelector.ts';

/** Get the logged-in account from the store, if any. */
export const useOwnAccount = () => {
  const getAccount = useCallback(makeGetAccount(), []);

  const account = useAppSelector((state) =>  {
    const { me } = state;

    if (typeof me === 'string') {
      return getAccount(state, me);
    }
  });

  return { account: account || undefined };
};
