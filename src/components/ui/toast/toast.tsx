import clsx from 'clsx';
import React from 'react';
import toast, { Toast as RHToast } from 'react-hot-toast';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import { ToastText, ToastType } from 'soapbox/toast';

import HStack from '../hstack/hstack';
import Icon from '../icon/icon';
import Stack from '../stack/stack';
import Text from '../text/text';

const renderText = (text: ToastText) => {
  if (typeof text === 'string') {
    return text;
  } else {
    return <FormattedMessage {...text} />;
  }
};

interface IToast {
  t: RHToast
  message: ToastText
  type: ToastType
  action?(): void
  actionLink?: string
  actionLabel?: ToastText
  summary?: string
}

/**
 * Customizable Toasts for in-app notifications.
 */
const Toast = (props: IToast) => {
  const { t, message, type, action, actionLink, actionLabel, summary } = props;

  const dismissToast = () => toast.dismiss(t.id);

  const renderIcon = () => {
    switch (type) {
      case 'success':
        return (
          <Icon
            src={require('@tabler/icons/circle-check.svg')}
            className='h-6 w-6 text-success-500 dark:text-success-400'
            aria-hidden
          />
        );
      case 'info':
        return (
          <Icon
            src={require('@tabler/icons/info-circle.svg')}
            className='h-6 w-6 text-primary-600 dark:text-accent-blue'
            aria-hidden
          />
        );
      case 'error':
        return (
          <Icon
            src={require('@tabler/icons/alert-circle.svg')}
            className='h-6 w-6 text-danger-600'
            aria-hidden
          />
        );
    }
  };

  const renderAction = () => {
    const classNames = 'mt-0.5 flex-shrink-0 rounded-full text-sm font-medium text-primary-600 dark:text-accent-blue hover:underline focus:outline-none';

    if (action && actionLabel) {
      return (
        <button
          type='button'
          className={classNames}
          onClick={() => {
            dismissToast();
            action();
          }}
          data-testid='toast-action'
        >
          {renderText(actionLabel)}
        </button>
      );
    }

    if (actionLink && actionLabel) {
      return (
        <Link
          to={actionLink}
          onClick={dismissToast}
          className={classNames}
          data-testid='toast-action-link'
        >
          {renderText(actionLabel)}
        </Link>
      );
    }

    return null;
  };

  return (
    <div
      data-testid='toast'
      className={
        clsx({
          'p-4 pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white dark:bg-gray-900 shadow-lg dark:ring-2 dark:ring-gray-800': true,
          'animate-enter': t.visible,
          'animate-leave': !t.visible,
        })
      }
    >
      <Stack space={2}>
        <HStack space={4} alignItems='start'>
          <HStack space={3} justifyContent='between' alignItems='start' className='w-0 flex-1'>
            <HStack space={3} alignItems='start' className='w-0 flex-1'>
              <div className='shrink-0'>
                {renderIcon()}
              </div>

              <Text
                size='sm'
                data-testid='toast-message'
                className='pt-0.5'
                weight={typeof summary === 'undefined' ? 'normal' : 'medium'}
              >
                {renderText(message)}
              </Text>
            </HStack>

            {/* Action */}
            {renderAction()}
          </HStack>

          {/* Dismiss Button */}
          <div className='flex shrink-0 pt-0.5'>
            <button
              type='button'
              className='inline-flex rounded-md text-gray-600 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:text-gray-600 dark:hover:text-gray-500'
              onClick={dismissToast}
              data-testid='toast-dismiss'
            >
              <span className='sr-only'>Close</span>
              <Icon src={require('@tabler/icons/x.svg')} className='h-5 w-5' />
            </button>
          </div>
        </HStack>

        {summary ? (
          <Text theme='muted' size='sm'>{summary}</Text>
        ) : null}
      </Stack>
    </div>
  );
};

export default Toast;
