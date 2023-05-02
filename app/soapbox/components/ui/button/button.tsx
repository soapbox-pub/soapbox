import clsx from 'clsx';
import React from 'react';
import { Link } from 'react-router-dom';

import Icon from '../icon/icon';

import { useButtonStyles } from './useButtonStyles';

import type { ButtonSizes, ButtonThemes } from './useButtonStyles';

interface IButton {
  /** Whether this button expands the width of its container. */
  block?: boolean
  /** Elements inside the <button> */
  children?: React.ReactNode
  /** Extra class names for the button. */
  className?: string
  /** Prevent the button from being clicked. */
  disabled?: boolean
  /** URL to an SVG icon to render inside the button. */
  icon?: string
  /** Action when the button is clicked. */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  /** A predefined button size. */
  size?: ButtonSizes
  /** Text inside the button. Takes precedence over `children`. */
  text?: React.ReactNode
  /** Makes the button into a navlink, if provided. */
  to?: string
  /** Styles the button visually with a predefined theme. */
  theme?: ButtonThemes
  /** Whether this button should submit a form by default. */
  type?: 'button' | 'submit'
}

/** Customizable button element with various themes. */
const Button = React.forwardRef<HTMLButtonElement, IButton>((props, ref): JSX.Element => {
  const {
    block = false,
    children,
    disabled = false,
    icon,
    onClick,
    size = 'md',
    text,
    theme = 'secondary',
    to,
    type = 'button',
    className,
  } = props;

  const body = text || children;

  const themeClass = useButtonStyles({
    theme,
    block,
    disabled,
    size,
  });

  const renderIcon = () => {
    if (!icon) {
      return null;
    }

    return <Icon src={icon} className='h-4 w-4' />;
  };

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = React.useCallback((event) => {
    if (onClick && !disabled) {
      onClick(event);
    }
  }, [onClick, disabled]);

  const renderButton = () => (
    <button
      className={clsx('space-x-2 rtl:space-x-reverse', themeClass, className)}
      disabled={disabled}
      onClick={handleClick}
      ref={ref}
      type={type}
      data-testid='button'
    >
      {renderIcon()}

      {body && (
        <span>{body}</span>
      )}
    </button>
  );

  if (to) {
    return (
      <Link to={to} tabIndex={-1} className='inline-flex'>
        {renderButton()}
      </Link>
    );
  }

  return renderButton();
});

export {
  Button as default,
  Button,
};
