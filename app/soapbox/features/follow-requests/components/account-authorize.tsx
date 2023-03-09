import React, { useCallback } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { authorizeFollowRequest, rejectFollowRequest } from 'soapbox/actions/accounts';
import Account from 'soapbox/components/account';
import { Button, HStack } from 'soapbox/components/ui';
import { useAppDispatch, useAppSelector } from 'soapbox/hooks';
import { makeGetAccount } from 'soapbox/selectors';

const messages = defineMessages({
  authorize: { id: 'follow_request.authorize', defaultMessage: 'Authorize' },
  reject: { id: 'follow_request.reject', defaultMessage: 'Reject' },
});

interface IAccountAuthorize {
  id: string
}

const AccountAuthorize: React.FC<IAccountAuthorize> = ({ id }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const getAccount = useCallback(makeGetAccount(), []);

  const account = useAppSelector((state) => getAccount(state, id));

  const onAuthorize = () => {
    dispatch(authorizeFollowRequest(id));
  };

  const onReject = () => {
    dispatch(rejectFollowRequest(id));
  };

  if (!account) return null;

  return (
    <HStack space={1} alignItems='center' justifyContent='between' className='p-2.5'>
      <div className='w-full'>
        <Account account={account} withRelationship={false} />
      </div>
      <HStack space={2}>
        <Button
          theme='secondary'
          size='sm'
          text={intl.formatMessage(messages.authorize)}
          icon={require('@tabler/icons/check.svg')}
          onClick={onAuthorize}
        />
        <Button
          theme='danger'
          size='sm'
          text={intl.formatMessage(messages.reject)}
          icon={require('@tabler/icons/x.svg')}
          onClick={onReject}
        />
      </HStack>
    </HStack>
  );
};

export default AccountAuthorize;
