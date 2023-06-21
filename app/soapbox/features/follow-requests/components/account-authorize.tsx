import React from 'react';

import { authorizeFollowRequest, rejectFollowRequest } from 'soapbox/actions/accounts';
import { useAccount } from 'soapbox/api/hooks';
import Account from 'soapbox/components/account';
import { AuthorizeRejectButtons } from 'soapbox/components/authorize-reject-buttons';
import { useAppDispatch } from 'soapbox/hooks';

interface IAccountAuthorize {
  id: string
}

const AccountAuthorize: React.FC<IAccountAuthorize> = ({ id }) => {
  const dispatch = useAppDispatch();
  const { account } = useAccount(id);

  const onAuthorize = () => dispatch(authorizeFollowRequest(id));
  const onReject = () => dispatch(rejectFollowRequest(id));

  if (!account) return null;

  return (
    <div className='p-2.5'>
      <Account
        account={account}
        action={
          <AuthorizeRejectButtons
            onAuthorize={onAuthorize}
            onReject={onReject}
            countdown={3000}
          />
        }
      />
    </div>
  );
};

export default AccountAuthorize;
