import { useAccount } from 'soapbox/api/hooks/index.ts';
import Account from 'soapbox/components/account.tsx';

interface IAutosuggestAccount {
  id: string;
}

const AutosuggestAccount: React.FC<IAutosuggestAccount> = ({ id }) => {
  const { account } = useAccount(id);
  if (!account) return null;

  return (
    <div className='snap-start snap-always'>
      <Account account={account} hideActions showProfileHoverCard={false} />
    </div>
  );

};

export default AutosuggestAccount;
