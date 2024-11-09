
import { approveUser, rejectUser } from 'soapbox/actions/admin';
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

  const adminAccount = useAppSelector(state => state.admin.users.get(accountId));
  const { account } = useAccount(adminAccount?.account || undefined);

  if (!adminAccount || !account) return null;

  const handleApprove = () => dispatch(approveUser(adminAccount.id));
  const handleReject = () => dispatch(rejectUser(adminAccount.id));

  return (
    <Account
      key={adminAccount.id}
      account={account}
      acct={adminAccount.domain ? `${adminAccount.username}@${adminAccount.domain}` : adminAccount.username}
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
