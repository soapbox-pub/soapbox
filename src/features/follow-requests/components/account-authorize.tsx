import { authorizeFollowRequest, rejectFollowRequest } from '@/actions/accounts.ts';
import { useAccount } from '@/api/hooks/index.ts';
import Account from '@/components/account.tsx';
import { AuthorizeRejectButtons } from '@/components/authorize-reject-buttons.tsx';
import { useAppDispatch } from '@/hooks/useAppDispatch.ts';

interface IAccountAuthorize {
  id: string;
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
            countdown={1000}
          />
        }
      />
    </div>
  );
};

export default AccountAuthorize;
