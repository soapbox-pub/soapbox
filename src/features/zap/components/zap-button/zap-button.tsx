import clsx from 'clsx';
import React from 'react';
import { Link } from 'react-router-dom';

const themes = {
  primary:
    'bg-primary-500 hover:bg-primary-400 dark:hover:bg-primary-600 border-transparent focus:bg-primary-500 text-gray-100 focus:ring-primary-300',
  secondary:
    'border-transparent bg-primary-100 dark:bg-primary-800 hover:bg-primary-50 dark:hover:bg-primary-700 focus:bg-primary-100 dark:focus:bg-primary-800 text-primary-500 dark:text-primary-200',
  tertiary:
    'bg-transparent border-gray-400 dark:border-gray-800 hover:border-primary-300 dark:hover:border-primary-700 focus:border-primary-500 text-gray-900 dark:text-gray-100 focus:ring-primary-500',
  accent: 'border-transparent bg-secondary-500 hover:bg-secondary-400 focus:bg-secondary-500 text-gray-100 focus:ring-secondary-300',
  danger: 'border-transparent bg-danger-100 dark:bg-danger-900 text-danger-600 dark:text-danger-200 hover:bg-danger-600 hover:text-gray-100 dark:hover:text-gray-100 dark:hover:bg-danger-500 focus:ring-danger-500',
  transparent: 'border-transparent bg-transparent text-primary-600 dark:text-accent-blue dark:bg-transparent hover:bg-gray-200 dark:hover:bg-gray-800/50',
  outline: 'border-gray-100 border-2 bg-transparent text-gray-100 hover:bg-white/10',
  muted: 'border border-solid bg-transparent border-gray-400 dark:border-gray-800 hover:border-primary-300 dark:hover:border-primary-700 focus:border-primary-500 text-gray-900 dark:text-gray-100 focus:ring-primary-500',
};

interface IButton {
  /** Whether this button expands the width of its container. */
  block?: boolean;
  /** Elements inside the <button> */
  children?: React.ReactNode;
  /** Extra class names for the button. */
  className?: string;
  /** Prevent the button from being clicked. */
  disabled?: boolean;
  /** Specifies the icon element as 'svg' or 'img'. */
  iconElement?: 'svg' | 'img';
  /** URL to an SVG icon to render inside the button. */
  icon?: string;
  /** Action when the button is clicked. */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Text inside the button. Takes precedence over `children`. */
  text?: React.ReactNode;
  /** Makes the button into a navlink, if provided. */
  to?: string;
  /** Styles the button visually with a predefined theme. */
  theme?: keyof typeof themes;
  /** Whether this button should submit a form by default. */
  type?: 'button' | 'submit';
}

/** Customizable button element with various themes. */
const ZapButton = React.forwardRef<HTMLButtonElement, IButton>((props, ref): JSX.Element => {
  const {
    disabled = false,
    icon,
    onClick,
    theme = 'secondary',
    to,
    text,
    type = 'button',
    className,
  } = props;

  const renderButton = () => (
    <button
      disabled={disabled}
      onClick={onClick}
      ref={ref}
      type={type}
      data-testid='button'
    >
      <div className={clsx(className, { 'flex flex-col items-center w-14 !box-border place-content-center border font-medium p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 appearance-none transition-all sm:p-4 sm:w-20': true,
        'select-none disabled:opacity-75 disabled:cursor-default': disabled,
        [`${themes[theme]}`]: true })}
      >
        <img className='w-16' src={icon} alt='stack coin' />
        <span className='text-base sm:text-2xl'>
          <p>
            {text}
          </p>
        </span>

      </div>
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
  ZapButton as default,
  ZapButton,
};
