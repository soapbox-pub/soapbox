import React, { useCallback } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { authorizeFollowRequest, rejectFollowRequest } from 'soapbox/actions/accounts';
import Account from 'soapbox/components/account';
import { IconButton, HStack } from 'soapbox/components/ui';
import { useAppDispatch, useAppSelector } from 'soapbox/hooks';
import { isMobile } from 'soapbox/is-mobile';
import { makeGetAccount } from 'soapbox/selectors';


const messages = defineMessages({
  authorize: { id: 'follow_request.authorize', defaultMessage: 'Authorize' },
  reject: { id: 'follow_request.reject', defaultMessage: 'Reject' },
});

interface IAccountAuthorize {
  id: string,
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
    <HStack space={1} alignItems='bottom' justifyContent='between' className='p-2.5'>
      <div className='max-sm:overflow-auto w-full'>
        <Account account={account} withRelationship={false} />


      </div>
      <HStack space={2}>
        <IconButton
          theme='outlined'
          className='bg-accent text-success-600 dark:text-success-600 md:pr-2.5'
          src={require('@tabler/icons/check.svg')}
          onClick={onAuthorize}
          text={!isMobile(window.innerWidth) ? intl.formatMessage(messages.authorize) : ''}
        />
        <IconButton
          theme='seamless'
          className='text-danger-600 dark:text-danger-600'
          src={require('@tabler/icons/x.svg')}
          onClick={onReject}
          text={!isMobile(window.innerWidth) ? intl.formatMessage(messages.reject) : ''}
        />
      </HStack>
    </HStack>
  );
};

export default AccountAuthorize;
