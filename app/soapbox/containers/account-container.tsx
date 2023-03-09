import React, { useCallback } from 'react';

import { useAppSelector } from 'soapbox/hooks';

import Account, { IAccount } from '../components/account';
import { makeGetAccount } from '../selectors';

interface IAccountContainer extends Omit<IAccount, 'account'> {
  id: string
}

const AccountContainer: React.FC<IAccountContainer> = ({ id, ...props }) => {
  const getAccount = useCallback(makeGetAccount(), []);
  const account = useAppSelector(state => getAccount(state, id));

  return (
    <Account account={account!} {...props} />
  );
};

export default AccountContainer;
