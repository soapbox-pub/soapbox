import clsx from 'clsx';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import Button from '../button/button';
import { ButtonThemes } from '../button/useButtonStyles';
import HStack from '../hstack/hstack';
import IconButton from '../icon-button/icon-button';

const messages = defineMessages({
  close: { id: 'lightbox.close', defaultMessage: 'Close' },
  confirm: { id: 'confirmations.delete.confirm', defaultMessage: 'Delete' },
});

const widths = {
  xs: 'max-w-xs',
  sm: 'max-w-sm',
  md: 'max-w-base',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
};

interface IModal {
  /** Callback when the modal is cancelled. */
  cancelAction?: () => void
  /** Cancel button text. */
  cancelText?: React.ReactNode
  /** URL to an SVG icon for the close button. */
  closeIcon?: string
  /** Position of the close button. */
  closePosition?: 'left' | 'right'
  /** Callback when the modal is confirmed. */
  confirmationAction?: (event?: React.MouseEvent<HTMLButtonElement>) => void
  /** Whether the confirmation button is disabled. */
  confirmationDisabled?: boolean
  /** Confirmation button text. */
  confirmationText?: React.ReactNode
  /** Confirmation button theme. */
  confirmationTheme?: ButtonThemes
  /** Whether to use full width style for confirmation button. */
  confirmationFullWidth?: boolean
  /** Callback when the modal is closed. */
  onClose?: () => void
  /** Callback when the secondary action is chosen. */
  secondaryAction?: (event?: React.MouseEvent<HTMLButtonElement>) => void
  /** Secondary button text. */
  secondaryText?: React.ReactNode
  secondaryDisabled?: boolean
  /** Don't focus the "confirm" button on mount. */
  skipFocus?: boolean
  /** Title text for the modal. */
  title?: React.ReactNode
  width?: keyof typeof widths
  children?: React.ReactNode
  className?: string
}

/** Displays a modal dialog box. */
const Modal = React.forwardRef<HTMLDivElement, IModal>(({
  cancelAction,
  cancelText,
  children,
  closeIcon = require('@tabler/icons/x.svg'),
  closePosition = 'right',
  confirmationAction,
  confirmationDisabled,
  confirmationText,
  confirmationTheme,
  confirmationFullWidth,
  onClose,
  secondaryAction,
  secondaryDisabled = false,
  secondaryText,
  skipFocus = false,
  title,
  width = 'xl',
  className,
}, ref) => {
  const intl = useIntl();
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (buttonRef?.current && !skipFocus) {
      buttonRef.current.focus();
    }
  }, [skipFocus, buttonRef]);

  return (
    <div
      ref={ref}
      data-testid='modal'
      className={clsx(className, 'pointer-events-auto mx-auto block w-full rounded-2xl bg-white p-6 text-start align-middle text-gray-900 shadow-xl transition-all dark:bg-primary-900 dark:text-gray-100', widths[width])}
    >
      <div className='w-full justify-between sm:flex sm:items-start'>
        <div className='w-full'>
          {title && (
            <div
              className={clsx('flex w-full items-center gap-2', {
                'flex-row-reverse': closePosition === 'left',
              })}
            >
              <h3 className='grow truncate text-lg font-bold leading-6 text-gray-900 dark:text-white'>
                {title}
              </h3>

              {onClose && (
                <IconButton
                  src={closeIcon}
                  title={intl.formatMessage(messages.close)}
                  onClick={onClose}
                  className='text-gray-500 hover:text-gray-700 rtl:rotate-180 dark:text-gray-300 dark:hover:text-gray-200'
                />
              )}
            </div>
          )}

          {title ? (
            <div className='mt-2 w-full'>
              {children}
            </div>
          ) : children}
        </div>
      </div>

      {confirmationAction && (
        <HStack className='mt-5' justifyContent='between' data-testid='modal-actions'>
          <div className={clsx({ 'grow': !confirmationFullWidth })}>
            {cancelAction && (
              <Button
                theme='tertiary'
                onClick={cancelAction}
              >
                {cancelText || 'Cancel'}
              </Button>
            )}
          </div>

          <HStack space={2} className={clsx({ 'grow': confirmationFullWidth })}>
            {secondaryAction && (
              <Button
                theme='secondary'
                onClick={secondaryAction}
                disabled={secondaryDisabled}
              >
                {secondaryText}
              </Button>
            )}

            <Button
              theme={confirmationTheme || 'primary'}
              onClick={confirmationAction}
              disabled={confirmationDisabled}
              ref={buttonRef}
              block={confirmationFullWidth}
            >
              {confirmationText}
            </Button>
          </HStack>
        </HStack>
      )}
    </div>
  );
});

export default Modal;
