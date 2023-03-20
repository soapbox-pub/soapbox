import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { HStack, IconButton, Text } from 'soapbox/components/ui';

interface IAuthorizeRejectButtons {
  id: string
  onAuthorize(id: string): Promise<unknown>
  onReject(id: string): Promise<unknown>
}

/** Buttons to approve or reject a pending item, usually an account. */
const AuthorizeRejectButtons: React.FC<IAuthorizeRejectButtons> = ({ id, onAuthorize, onReject }) => {
  const [state, setState] = useState<'authorized' | 'rejected' | 'pending'>('pending');

  function handleAuthorize() {
    onAuthorize(id)
      .then(() => setState('authorized'))
      .catch(console.error);
  }

  function handleReject() {
    onReject(id)
      .then(() => setState('rejected'))
      .catch(console.error);
  }

  switch (state) {
    case 'pending':
      return (
        <HStack space={3} alignItems='center'>
          <IconButton
            src={require('@tabler/icons/x.svg')}
            onClick={handleReject}
            theme='outlined'
            className='h-10 w-10 items-center justify-center border-2 border-danger-600/10 hover:border-danger-600 dark:border-danger-600/10 dark:hover:border-danger-600'
            iconClassName='h-6 w-6 text-danger-600'
          />
          <IconButton
            src={require('@tabler/icons/check.svg')}
            onClick={handleAuthorize}
            theme='outlined'
            className='h-10 w-10 items-center justify-center border-2 border-primary-500/10 hover:border-primary-500 dark:border-primary-500/10 dark:hover:border-primary-500'
            iconClassName='h-6 w-6 text-primary-500'
          />
        </HStack>
      );
    case 'authorized':
      return (
        <div className='rounded-full bg-gray-100 px-4 py-2 dark:bg-gray-800'>
          <Text theme='muted' size='sm'>
            <FormattedMessage id='authorize.success' defaultMessage='Authorized' />
          </Text>
        </div>
      );
    case 'rejected':
      return (
        <div className='rounded-full bg-gray-100 px-4 py-2 dark:bg-gray-800'>
          <Text theme='muted' size='sm'>
            <FormattedMessage id='reject.success' defaultMessage='Rejected' />
          </Text>
        </div>
      );
  }
};

export { AuthorizeRejectButtons };