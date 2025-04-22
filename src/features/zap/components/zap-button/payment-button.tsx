import clsx from 'clsx';
import { forwardRef } from 'react';
import { Link } from 'react-router-dom';

import { shortNumberFormat } from 'soapbox/utils/numbers.tsx';

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
  /** Amount of sats. */
  amount?: number;
  /** Makes the button into a navlink, if provided. */
  to?: string;
  /** Change the button style if it is selected. */
  selected: boolean;
  /** Whether this button should submit a form by default. */
  type?: 'button' | 'submit';
}

/** Customizable button element. */
const PaymentButton = forwardRef<HTMLButtonElement, IButton>((props, ref): JSX.Element => {
  const {
    disabled = false,
    icon,
    onClick,
    selected,
    to,
    amount,
    type = 'button',
    className,
  } = props;

  const renderButton = () => (
    <button
      disabled={disabled}
      onClick={onClick}
      ref={ref}
      type={type}
      className={clsx(className, '!box-border flex flex-1 appearance-none flex-col place-content-center items-center rounded-xl border p-2 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 sm:w-20', {
        'select-none disabled:opacity-75 disabled:cursor-default': disabled,
        'bg-primary-500 hover:bg-primary-400 dark:hover:bg-primary-600 border-transparent focus:bg-primary-500 text-gray-100 focus:ring-primary-300': selected,
        'border border-solid bg-transparent border-gray-400 dark:border-gray-800 hover:border-primary-300 dark:hover:border-primary-700 focus:border-primary-500 text-gray-900 dark:text-gray-100 focus:ring-primary-500': !selected })}
    >
      <img className='w-full flex-1' src={icon} alt='' />

      <span className='justify-self-end text-base sm:text-2xl'>
        <p>
          {shortNumberFormat(amount)}
        </p>
      </span>
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
  PaymentButton as default,
  PaymentButton,
};
