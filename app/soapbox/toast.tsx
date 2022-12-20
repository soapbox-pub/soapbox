import { AxiosError } from 'axios';
import classNames from 'clsx';
import React from 'react';
import toast, { Toast } from 'react-hot-toast';
import { defineMessages, FormattedMessage, MessageDescriptor } from 'react-intl';
import { Link } from 'react-router-dom';

import { Icon } from './components/ui';
import { httpErrorMessages } from './utils/errors';

type ToastText = string | MessageDescriptor
type ToastType = 'success' | 'error' | 'info'

interface IToastOptions {
  action?(): void
  actionLink?: string
  actionLabel?: ToastText
  duration?: number
}

const DEFAULT_DURATION = 4000;

const renderText = (text: ToastText) => {
  if (typeof text === 'string') {
    return text;
  } else {
    return <FormattedMessage {...text} />;
  }
};

const buildToast = (t: Toast, message: ToastText, type: ToastType, opts: Omit<IToastOptions, 'duration'> = {}) => {
  const { action, actionLabel, actionLink } = opts;

  const dismissToast = () => toast.dismiss(t.id);

  const renderIcon = () => {
    switch (type) {
      case 'success':
        return (
          <Icon
            src={require('@tabler/icons/circle-check.svg')}
            className='w-6 h-6 text-success-500 dark:text-success-400'
            aria-hidden
          />
        );
      case 'info':
        return (
          <Icon
            src={require('@tabler/icons/info-circle.svg')}
            className='w-6 h-6 text-primary-600 dark:text-accent-blue'
            aria-hidden
          />
        );
      case 'error':
        return (
          <Icon
            src={require('@tabler/icons/alert-circle.svg')}
            className='w-6 h-6 text-danger-600'
            aria-hidden
          />
        );
    }
  };

  const renderAction = () => {
    const classNames = 'ml-3 mt-0.5 flex-shrink-0 rounded-full text-sm font-medium text-primary-600 dark:text-accent-blue hover:underline focus:outline-none';

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
        classNames({
          'pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white dark:bg-gray-900 shadow-lg dark:ring-2 dark:ring-gray-800': true,
          'animate-enter': t.visible,
          'animate-leave': !t.visible,
        })
      }
    >
      <div className='p-4'>
        <div className='flex items-start'>
          <div className='flex w-0 flex-1 justify-between items-start'>
            <div className='w-0 flex-1 flex items-start'>
              <div className='flex-shrink-0'>
                {renderIcon()}
              </div>

              <p className='ml-3 pt-0.5 text-sm text-gray-900 dark:text-gray-100' data-testid='toast-message'>
                {renderText(message)}
              </p>
            </div>

            {/* Action */}
            {renderAction()}
          </div>

          {/* Dismiss Button */}
          <div className='ml-4 flex flex-shrink-0 pt-0.5'>
            <button
              type='button'
              className='inline-flex rounded-md text-gray-600 dark:text-gray-600 hover:text-gray-700 dark:hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
              onClick={dismissToast}
              data-testid='toast-dismiss'
            >
              <span className='sr-only'>Close</span>
              <Icon src={require('@tabler/icons/x.svg')} className='w-5 h-5' />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const createToast = (type: ToastType, message: ToastText, opts?: IToastOptions) => {
  const duration = opts?.duration || DEFAULT_DURATION;

  toast.custom((t) => buildToast(t, message, type, opts), {
    duration,
  });
};

function info(message: ToastText, opts?: IToastOptions) {
  createToast('info', message, opts);
}

function success(message: ToastText, opts?: IToastOptions) {
  createToast('success', message, opts);
}

function error(message: ToastText, opts?: IToastOptions) {
  createToast('error', message, opts);
}

const messages = defineMessages({
  unexpectedMessage: { id: 'alert.unexpected.message', defaultMessage: 'An unexpected error occurred.' },
});

function showAlertForError(networkError: AxiosError<any>) {
  if (networkError?.response) {
    const { data, status, statusText } = networkError.response;

    if (status === 502) {
      return error('The server is down');
    }

    if (status === 404 || status === 410) {
      // Skip these errors as they are reflected in the UI
      return null;
    }

    let message: string | undefined = statusText;

    if (data?.error) {
      message = data.error;
    }

    if (!message) {
      message = httpErrorMessages.find((httpError) => httpError.code === status)?.description;
    }

    if (message) {
      return error(message);
    }
  } else {
    console.error(networkError);
    return error(messages.unexpectedMessage);
  }
}

export default {
  info,
  success,
  error,
  showAlertForError,
};