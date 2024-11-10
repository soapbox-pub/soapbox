import { authorizeFollowRequest, rejectFollowRequest } from 'soapbox/actions/accounts.ts';
import { useAccount } from 'soapbox/api/hooks/index.ts';
import Account from 'soapbox/components/account.tsx';
import { AuthorizeRejectButtons } from 'soapbox/components/authorize-reject-buttons.tsx';
import { useAppDispatch } from 'soapbox/hooks/index.ts';

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
