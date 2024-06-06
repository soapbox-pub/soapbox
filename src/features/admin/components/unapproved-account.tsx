import React from 'react';

import { approveUsers, deleteUsers } from 'soapbox/actions/admin';
import { useAccount } from 'soapbox/api/hooks';
import Account from 'soapbox/components/account';
import { AuthorizeRejectButtons } from 'soapbox/components/authorize-reject-buttons';
import { useAppSelector, useAppDispatch } from 'soapbox/hooks';

interface IUnapprovedAccount {
  accountId: string;
}

/** Displays an unapproved account for moderation purposes. */
const UnapprovedAccount: React.FC<IUnapprovedAccount> = ({ accountId }) => {
  const dispatch = useAppDispatch();

  const { account } = useAccount(accountId);
  const adminAccount = useAppSelector(state => state.admin.users.get(accountId));

  if (!account) return null;

  const handleApprove = () => dispatch(approveUsers([account.id]));
  const handleReject = () => dispatch(deleteUsers([account.id]));

  return (
    <Account
      key={account.id}
      account={account}
      note={adminAccount?.invite_request || ''}
      action={(
        <AuthorizeRejectButtons
          onAuthorize={handleApprove}
          onReject={handleReject}
          countdown={1000}
        />
      )}
    />
  );
};

export default UnapprovedAccount;
