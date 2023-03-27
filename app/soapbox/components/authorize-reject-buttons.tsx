import React, { useEffect, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { HStack, IconButton, Text } from 'soapbox/components/ui';

interface IAuthorizeRejectButtons {
  onAuthorize(): Promise<unknown> | unknown
  onReject(): Promise<unknown> | unknown
  countdown?: number
}

/** Buttons to approve or reject a pending item, usually an account. */
const AuthorizeRejectButtons: React.FC<IAuthorizeRejectButtons> = ({ onAuthorize, onReject, countdown = 0 }) => {
  const [state, setState] = useState<'authorizing' | 'rejecting' | 'authorized' | 'rejected' | 'pending'>('pending');
  const timeout = useRef<NodeJS.Timeout>();

  function handleAction(
    present: 'authorizing' | 'rejecting',
    past: 'authorized' | 'rejected',
    action: () => Promise<unknown> | unknown,
  ): void {
    if (state === present) {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
      setState('pending');
    } else {
      setState(present);
      timeout.current = setTimeout(async () => {
        try {
          await action();
          setState(past);
        } catch (e) {
          console.error(e);
        }
      }, countdown);
    }
  }

  const handleAuthorize = async () => handleAction('authorizing', 'authorized', onAuthorize);
  const handleReject = async () => handleAction('rejecting', 'rejected', onReject);

  useEffect(() => {
    return () => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
    };
  }, []);

  switch (state) {
    case 'authorized':
      return (
        <div className='rounded-full bg-gray-100 px-4 py-2 dark:bg-gray-800'>
          <Text theme='muted' size='sm'>
            <FormattedMessage id='authorize.success' defaultMessage='Approved' />
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
    default:
      return (
        <HStack space={3} alignItems='center'>
          <IconButton
            src={state === 'rejecting' ? require('@tabler/icons/player-stop-filled.svg') : require('@tabler/icons/x.svg')}
            onClick={handleReject}
            theme='seamless'
            className='h-10 w-10 items-center justify-center border-2 border-danger-600/10 hover:border-danger-600'
            iconClassName='h-6 w-6 text-danger-600'
            disabled={state === 'authorizing'}
          />
          <IconButton
            src={state === 'authorizing' ? require('@tabler/icons/player-stop-filled.svg') : require('@tabler/icons/check.svg')}
            onClick={handleAuthorize}
            theme='seamless'
            className='h-10 w-10 items-center justify-center border-2 border-primary-500/10 hover:border-primary-500'
            iconClassName='h-6 w-6 text-primary-500'
            disabled={state === 'rejecting'}
          />
        </HStack>
      );
  }
};

export { AuthorizeRejectButtons };