import React from 'react';

import { useAccount } from 'soapbox/api/hooks';
import Account, { IAccount } from 'soapbox/components/account';

interface IAccountContainer extends Omit<IAccount, 'account'> {
  id: string
}

const AccountContainer: React.FC<IAccountContainer> = ({ id, ...props }) => {
  const { account } = useAccount(id);

  return (
    <Account account={account!} {...props} />
  );
};

export default AccountContainer;
