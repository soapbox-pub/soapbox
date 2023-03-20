import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { Button, HStack, IconButton } from 'soapbox/components/ui';

const messages = defineMessages({
  authorize: { id: 'authorize', defaultMessage: 'Accept' },
  authorized: { id: 'authorize.success', defaultMessage: 'Accepted' },
  reject: { id: 'reject', defaultMessage: 'Reject' },
  rejected: { id: 'reject.success', defaultMessage: 'Rejected' },
});

interface IAuthorizeRejectButtons {
  id: string
  onAuthorize(id: string): Promise<unknown>
  onReject(id: string): Promise<unknown>
}

/** Buttons to approve or reject a pending item, usually an account. */
const AuthorizeRejectButtons: React.FC<IAuthorizeRejectButtons> = ({ id, onAuthorize, onReject }) => {
  const intl = useIntl();
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
        <Button
          size='sm'
          text={intl.formatMessage(messages.authorized)}
          disabled
        />
      );
    case 'rejected':
      return (
        <Button
          size='sm'
          text={intl.formatMessage(messages.rejected)}
          disabled
        />
      );
  }
};

export { AuthorizeRejectButtons };