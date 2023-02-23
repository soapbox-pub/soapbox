import React, { useCallback } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import AccountComponent from 'soapbox/components/account';
import Icon from 'soapbox/components/icon';
import { HStack } from 'soapbox/components/ui';
import { useAppSelector } from 'soapbox/hooks';
import { makeGetAccount } from 'soapbox/selectors';

const messages = defineMessages({
  birthday: { id: 'account.birthday', defaultMessage: 'Born {date}' },
});

interface IAccount {
  accountId: string
}

const Account: React.FC<IAccount> = ({ accountId }) => {
  const intl = useIntl();
  const getAccount = useCallback(makeGetAccount(), []);

  const account = useAppSelector((state) => getAccount(state, accountId));

  if (!account) return null;

  const birthday = account.birthday;
  if (!birthday) return null;

  const formattedBirthday = intl.formatDate(birthday, { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <HStack space={1} alignItems='center' justifyContent='between' className='p-2.5'>
      <div className='w-full'>
        <AccountComponent account={account} withRelationship={false} />
      </div>
      <div
        className='flex items-center gap-0.5'
        title={intl.formatMessage(messages.birthday, {
          date: formattedBirthday,
        })}
      >
        <Icon src={require('@tabler/icons/balloon.svg')} />
        {formattedBirthday}
      </div>
    </HStack>
  );
};

export default Account;
