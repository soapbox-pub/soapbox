import { approveUser, rejectUser } from '@/actions/admin.ts';
import { useAccount } from '@/api/hooks/index.ts';
import Account from '@/components/account.tsx';
import { AuthorizeRejectButtons } from '@/components/authorize-reject-buttons.tsx';
import { useAppDispatch } from '@/hooks/useAppDispatch.ts';
import { useAppSelector } from '@/hooks/useAppSelector.ts';

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
