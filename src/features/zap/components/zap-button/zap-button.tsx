import clsx from 'clsx';
import React from 'react';

import { themes } from './useZapButtonStyles';

interface IZapButton {
  /** Extra class names for the button. */
  className?: string;
  /** URL to an SVG icon to render inside the button. */
  icon?: string;
  /** Action when the button is clicked. */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Text inside the button. Takes precedence over `children`. */
  text?: React.ReactNode;
  /** Styles the button visually with a predefined theme. */
  theme?: keyof typeof themes;
  /** Whether this button should submit a form by default. */
  type?: 'button' | 'submit';
}

/** Customizable button element with various themes. */
const ZapButton = React.forwardRef<HTMLButtonElement, IZapButton>((props, ref): JSX.Element => {
  const {
    icon,
    onClick,
    theme = 'secondary',
    text,
    type = 'button',
    className,
  } = props;

  const renderButton = () => (
    <button
      onClick={onClick}
      ref={ref}
      type={type}
      data-testid='button'
    >
      <div className={clsx(className, { 'flex flex-col items-center w-12 !box-border place-content-center border font-medium p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 appearance-none transition-all sm:w-20 sm:p-4': true,
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

  return renderButton();
});

export {
  ZapButton as default,
  ZapButton,
};
