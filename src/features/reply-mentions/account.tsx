import React, { useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { fetchAccount } from 'soapbox/actions/accounts';
import { addToMentions, removeFromMentions } from 'soapbox/actions/compose';
import { useAccount } from 'soapbox/api/hooks';
import AccountComponent from 'soapbox/components/account';
import IconButton from 'soapbox/components/icon-button';
import { HStack } from 'soapbox/components/ui';
import { useAppDispatch, useCompose } from 'soapbox/hooks';

const messages = defineMessages({
  remove: { id: 'reply_mentions.account.remove', defaultMessage: 'Remove from mentions' },
  add: { id: 'reply_mentions.account.add', defaultMessage: 'Add to mentions' },
});

interface IAccount {
  composeId: string
  accountId: string
  author: boolean
}

const Account: React.FC<IAccount> = ({ composeId, accountId, author }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const compose = useCompose(composeId);
  const { account } = useAccount(accountId);
  const added = !!account && compose.to?.includes(account.acct);

  const onRemove = () => dispatch(removeFromMentions(composeId, accountId));
  const onAdd = () => dispatch(addToMentions(composeId, accountId));

  useEffect(() => {
    if (accountId && !account) {
      dispatch(fetchAccount(accountId));
    }
  }, []);

  if (!account) return null;

  let button;

  if (added) {
    button = <IconButton src={require('@tabler/icons/x.svg')} iconClassName='h-5 w-5' title={intl.formatMessage(messages.remove)} onClick={onRemove} />;
  } else {
    button = <IconButton src={require('@tabler/icons/plus.svg')} iconClassName='h-5 w-5' title={intl.formatMessage(messages.add)} onClick={onAdd} />;
  }

  return (
    <HStack space={1} alignItems='center' justifyContent='between' className='p-2.5'>
      <div className='w-full'>
        <AccountComponent account={account} withRelationship={false} withLinkToProfile={false} />
      </div>
      {!author && button}
    </HStack>
  );
};

export default Account;
