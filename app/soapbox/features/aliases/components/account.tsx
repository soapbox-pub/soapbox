import React, { useCallback } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { addToAliases } from 'soapbox/actions/aliases';
import AccountComponent from 'soapbox/components/account';
import IconButton from 'soapbox/components/icon-button';
import { HStack } from 'soapbox/components/ui';
import { useAppDispatch, useAppSelector, useFeatures } from 'soapbox/hooks';
import { makeGetAccount } from 'soapbox/selectors';

import type { List as ImmutableList } from 'immutable';

const messages = defineMessages({
  add: { id: 'aliases.account.add', defaultMessage: 'Create alias' },
});

interface IAccount {
  accountId: string
  aliases: ImmutableList<string>
}

const Account: React.FC<IAccount> = ({ accountId, aliases }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const features = useFeatures();

  const getAccount = useCallback(makeGetAccount(), []);
  const account = useAppSelector((state) => getAccount(state, accountId));
  const me = useAppSelector((state) => state.me);

  const added = useAppSelector((state) => {
    const account = getAccount(state, accountId);
    const apId = account?.pleroma.get('ap_id');
    const name = features.accountMoving ? account?.acct : apId;

    return aliases.includes(name);
  });

  const handleOnAdd = () => dispatch(addToAliases(account!));

  if (!account) return null;

  let button;

  if (!added && accountId !== me) {
    button = (
      <IconButton src={require('@tabler/icons/plus.svg')} iconClassName='h-5 w-5' title={intl.formatMessage(messages.add)} onClick={handleOnAdd} />
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
