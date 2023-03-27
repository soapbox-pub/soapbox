import React, { useCallback } from 'react';

import { authorizeFollowRequest, rejectFollowRequest } from 'soapbox/actions/accounts';
import Account from 'soapbox/components/account';
import { AuthorizeRejectButtons } from 'soapbox/components/authorize-reject-buttons';
import { useAppDispatch, useAppSelector } from 'soapbox/hooks';
import { makeGetAccount } from 'soapbox/selectors';

interface IAccountAuthorize {
  id: string
}

const AccountAuthorize: React.FC<IAccountAuthorize> = ({ id }) => {
  const dispatch = useAppDispatch();

  const getAccount = useCallback(makeGetAccount(), []);
  const account = useAppSelector((state) => getAccount(state, id));

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
          />
        }
      />
    </div>
  );
};

export default AccountAuthorize;
