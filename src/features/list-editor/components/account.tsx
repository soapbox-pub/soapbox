import plusIcon from '@tabler/icons/outline/plus.svg';
import xIcon from '@tabler/icons/outline/x.svg';
import { defineMessages, useIntl } from 'react-intl';

import { removeFromListEditor, addToListEditor } from 'soapbox/actions/lists.ts';
import IconButton from 'soapbox/components/icon-button.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import AccountContainer from 'soapbox/containers/account-container.tsx';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';

const messages = defineMessages({
  remove: { id: 'lists.account.remove', defaultMessage: 'Remove from list' },
  add: { id: 'lists.account.add', defaultMessage: 'Add to list' },
});

interface IAccount {
  accountId: string;
}

const Account: React.FC<IAccount> = ({ accountId }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const isAdded = useAppSelector((state) => state.listEditor.accounts.items.includes(accountId));

  const onRemove = () => dispatch(removeFromListEditor(accountId));
  const onAdd = () => dispatch(addToListEditor(accountId));

  let button;

  if (isAdded) {
    button = <IconButton src={xIcon} iconClassName='h-5 w-5' title={intl.formatMessage(messages.remove)} onClick={onRemove} />;
  } else {
    button = <IconButton src={plusIcon} iconClassName='h-5 w-5' title={intl.formatMessage(messages.add)} onClick={onAdd} />;
  }

  return (
    <HStack space={1} alignItems='center' justifyContent='between' className='p-2.5'>
      <div className='w-full'>
        <AccountContainer id={accountId} withRelationship={false} />
      </div>
      {button}
    </HStack>
  );
};

export default Account;
