import React from 'react';

import { useAccount } from 'soapbox/api/hooks';
import Account, { IAccount } from 'soapbox/components/account';

interface IAccountContainer extends Omit<IAccount, 'account'> {
  id: string
  withRelationship?: boolean
}

const AccountContainer: React.FC<IAccountContainer> = ({ id, withRelationship, ...props }) => {
  const { account } = useAccount(id, { withRelationship });

  return (
    <Account account={account!} {...props} />
  );
};

export default AccountContainer;
