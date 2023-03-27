import clsx from 'clsx';
import React, { useEffect, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { HStack, IconButton, Text } from 'soapbox/components/ui';

interface IAuthorizeRejectButtons {
  onAuthorize(): Promise<unknown> | unknown
  onReject(): Promise<unknown> | unknown
  countdown?: number
}

/** Buttons to approve or reject a pending item, usually an account. */
const AuthorizeRejectButtons: React.FC<IAuthorizeRejectButtons> = ({ onAuthorize, onReject, countdown }) => {
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
        <ActionEmblem text={<FormattedMessage id='authorize.success' defaultMessage='Approved' />} />
      );
    case 'rejected':
      return (
        <ActionEmblem text={<FormattedMessage id='reject.success' defaultMessage='Rejected' />} />
      );
    default:
      return (
        <HStack space={3} alignItems='center'>
          <AuthorizeRejectButton
            theme='danger'
            icon={require('@tabler/icons/x.svg')}
            action={handleReject}
            isLoading={state === 'rejecting'}
            disabled={state === 'authorizing'}
          />
          <AuthorizeRejectButton
            theme='primary'
            icon={require('@tabler/icons/check.svg')}
            action={handleAuthorize}
            isLoading={state === 'authorizing'}
            disabled={state === 'rejecting'}
          />
        </HStack>
      );
  }
};

interface IActionEmblem {
  text: React.ReactNode
}

const ActionEmblem: React.FC<IActionEmblem> = ({ text }) => {
  return (
    <div className='rounded-full bg-gray-100 px-4 py-2 dark:bg-gray-800'>
      <Text theme='muted' size='sm'>
        {text}
      </Text>
    </div>
  );
};

interface IAuthorizeRejectButton {
  theme: 'primary' | 'danger'
  icon: string
  action(): void
  isLoading?: boolean
  disabled?: boolean
}

const AuthorizeRejectButton: React.FC<IAuthorizeRejectButton> = ({ theme, icon, action, isLoading, disabled }) => {
  return (
    <div className='relative'>
      <IconButton
        src={isLoading ? require('@tabler/icons/player-stop-filled.svg') : icon}
        onClick={action}
        theme='seamless'
        className={clsx('h-10 w-10 items-center justify-center border-2', {
          'border-primary-500/10 hover:border-primary-500': theme === 'primary',
          'border-danger-600/10 hover:border-danger-600': theme === 'danger',
        })}
        iconClassName={clsx('h-6 w-6', {
          'text-primary-500': theme === 'primary',
          'text-danger-600': theme === 'danger',
        })}
        disabled={disabled}
      />
      {(isLoading) && (
        <div
          className={clsx('pointer-events-none absolute inset-0 h-10 w-10 animate-spin rounded-full border-2 border-transparent', {
            'border-t-primary-500': theme === 'primary',
            'border-t-danger-600': theme === 'danger',
          })}
        />
      )}
    </div>
  );
};

export { AuthorizeRejectButtons };