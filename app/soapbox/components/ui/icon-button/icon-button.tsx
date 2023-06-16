import clsx from 'clsx';
import React from 'react';

import SvgIcon from '../icon/svg-icon';
import Text from '../text/text';

interface IIconButton extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Class name for the <svg> icon. */
  iconClassName?: string
  /** URL to the svg icon. */
  src: string
  /** Text to display next ot the button. */
  text?: string
  /** Predefined styles to display for the button. */
  theme?: 'seamless' | 'outlined' | 'secondary' | 'transparent' | 'dark'
  /** Override the data-testid */
  'data-testid'?: string
}

/** A clickable icon. */
const IconButton = React.forwardRef((props: IIconButton, ref: React.ForwardedRef<HTMLButtonElement>): JSX.Element => {
  const { src, className, iconClassName, text, theme = 'seamless', ...filteredProps } = props;

  return (
    <button
      ref={ref}
      type='button'
      className={clsx('flex items-center space-x-2 rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:ring-offset-0', {
        'bg-white dark:bg-transparent': theme === 'seamless',
        'border border-solid bg-transparent border-gray-400 dark:border-gray-800 hover:border-primary-300 dark:hover:border-primary-700 focus:border-primary-500 text-gray-900 dark:text-gray-100 focus:ring-primary-500': theme === 'outlined',
        'border-transparent bg-primary-100 dark:bg-primary-800 hover:bg-primary-50 dark:hover:bg-primary-700 focus:bg-primary-100 dark:focus:bg-primary-800 text-primary-500 dark:text-primary-200': theme === 'secondary',
        'bg-gray-900 text-white': theme === 'dark',
        'opacity-50': filteredProps.disabled,
      }, className)}
      {...filteredProps}
      data-testid={filteredProps['data-testid'] || 'icon-button'}
    >
      <SvgIcon src={src} className={iconClassName} />

      {text ? (
        <Text tag='span' theme='inherit' size='sm'>
          {text}
        </Text>
      ) : null}
    </button>
  );
});

export default IconButton;
