import plusIcon from '@tabler/icons/outline/plus.svg';
import { defineMessages, useIntl } from 'react-intl';

import { addToAliases } from 'soapbox/actions/aliases.ts';
import { useAccount } from 'soapbox/api/hooks/index.ts';
import AccountComponent from 'soapbox/components/account.tsx';
import IconButton from 'soapbox/components/icon-button.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import { useAppDispatch, useAppSelector, useFeatures } from 'soapbox/hooks/index.ts';

const messages = defineMessages({
  add: { id: 'aliases.account.add', defaultMessage: 'Create alias' },
});

interface IAccount {
  accountId: string;
  aliases: string[];
}

const Account: React.FC<IAccount> = ({ accountId, aliases }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const features = useFeatures();

  const me = useAppSelector((state) => state.me);
  const { account } = useAccount(accountId);

  const apId = account?.pleroma?.ap_id;
  const name = features.accountMoving ? account?.acct : apId;
  const added = name ? aliases.includes(name) : false;

  const handleOnAdd = () => dispatch(addToAliases(account!));

  if (!account) return null;

  let button;

  if (!added && accountId !== me) {
    button = (
      <IconButton src={plusIcon} iconClassName='h-5 w-5' title={intl.formatMessage(messages.add)} onClick={handleOnAdd} />
    );
  }

  return (
    <HStack space={1} alignItems='center' justifyContent='between' className='p-2.5'>
      <div className='w-full'>
        <AccountComponent account={account} withRelationship={false} />
      </div>
      {button}
    </HStack>
  );
};

export default Account;
