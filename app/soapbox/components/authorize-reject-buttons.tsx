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
  const interval = useRef<ReturnType<typeof setInterval>>();

  const [progress, setProgress] = useState<number>(0);

  const startProgressInterval = () => {
    let startValue = 1;
    interval.current = setInterval(() => {
      startValue++;
      const newValue = startValue * 3.6; // get to 360 (deg)
      setProgress(newValue);

      if (newValue >= 360) {
        clearInterval(interval.current as NodeJS.Timeout);
        setProgress(0);
      }
    }, (countdown as number) / 100);
  };

  function handleAction(
    present: 'authorizing' | 'rejecting',
    past: 'authorized' | 'rejected',
    action: () => Promise<unknown> | unknown,
  ): void {
    if (state === present) {
      if (interval.current) {
        clearInterval(interval.current);
      }
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
      setState('pending');
    } else {
      const doAction = async () => {
        try {
          await action();
          setState(past);
        } catch (e) {
          if (e) console.error(e);
        }
      };
      if (typeof countdown === 'number') {
        setState(present);
        timeout.current = setTimeout(doAction, countdown);
        startProgressInterval();
      } else {
        doAction();
      }
    }
  }

  const handleAuthorize = async () => handleAction('authorizing', 'authorized', onAuthorize);
  const handleReject = async () => handleAction('rejecting', 'rejected', onReject);

  const renderStyle = (selectedState: typeof state) => {
    if (state === 'authorizing' && selectedState === 'authorizing') {
      return {
        background: `conic-gradient(rgb(var(--color-primary-500)) ${progress}deg, rgb(var(--color-primary-500) / 0.1) 0deg)`,
      };
    } else if (state === 'rejecting' && selectedState === 'rejecting') {
      return {
        background: `conic-gradient(rgb(var(--color-danger-600)) ${progress}deg, rgb(var(--color-danger-600) / 0.1) 0deg)`,
      };
    }

    return {};
  };

  useEffect(() => {
    return () => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
      if (interval.current) {
        clearInterval(interval.current);
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
            style={renderStyle('rejecting')}
          />
          <AuthorizeRejectButton
            theme='primary'
            icon={require('@tabler/icons/check.svg')}
            action={handleAuthorize}
            isLoading={state === 'authorizing'}
            disabled={state === 'rejecting'}
            style={renderStyle('authorizing')}
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
  style: React.CSSProperties
}

const AuthorizeRejectButton: React.FC<IAuthorizeRejectButton> = ({ theme, icon, action, isLoading, style, disabled }) => {
  return (
    <div className='relative'>
      <div
        style={style}
        className={
          clsx({
            'flex h-11 w-11 items-center justify-center rounded-full': true,
            'bg-danger-600/10': theme === 'danger',
            'bg-primary-500/10': theme === 'primary',
          })
        }
      >
        <IconButton
          src={isLoading ? require('@tabler/icons/player-stop-filled.svg') : icon}
          onClick={action}
          theme='seamless'
          className='h-10 w-10 items-center justify-center bg-white focus:!ring-0 dark:!bg-gray-900'
          iconClassName={clsx('h-6 w-6', {
            'text-primary-500': theme === 'primary',
            'text-danger-600': theme === 'danger',
          })}
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export { AuthorizeRejectButtons };