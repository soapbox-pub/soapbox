import { useAccount } from 'soapbox/api/hooks/index.ts';
import Account, { IAccount } from 'soapbox/components/account.tsx';

interface IAccountContainer extends Omit<IAccount, 'account'> {
  id: string;
  withRelationship?: boolean;
}

const AccountContainer: React.FC<IAccountContainer> = ({ id, withRelationship, ...props }) => {
  const { account } = useAccount(id, { withRelationship });

  return (
    <Account account={account!} withRelationship={withRelationship} {...props} />
  );
};

export default AccountContainer;
