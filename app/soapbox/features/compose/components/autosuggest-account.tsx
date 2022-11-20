import React, { useCallback } from 'react';

import Account from 'soapbox/components/account';
import { useAppSelector } from 'soapbox/hooks';
import { makeGetAccount } from 'soapbox/selectors';

interface IAutosuggestAccount {
  id: string,
}

const AutosuggestAccount: React.FC<IAutosuggestAccount> = ({ id }) => {
  const getAccount = useCallback(makeGetAccount(), []);
  const account = useAppSelector((state) => getAccount(state, id));

  if (!account) return null;

  return (
    <div className='relative'>
      {/* HACK: The <Account> component stops click events, so insert this div as something to click. */}
      <div className='absolute inset-0' />

      <Account account={account} showProfileHoverCard={false} withLinkToProfile={false} hideActions />
    </div>
  );

};

export default AutosuggestAccount;
