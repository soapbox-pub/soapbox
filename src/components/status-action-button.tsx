import clsx from 'clsx';
import { forwardRef } from 'react';

import Emoji from 'soapbox/components/ui/emoji.tsx';
import Icon from 'soapbox/components/ui/icon.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import { shortNumberFormat } from 'soapbox/utils/numbers.tsx';

import type { EmojiReaction } from 'soapbox/schemas/index.ts';

const COLORS = {
  accent: 'accent',
  success: 'success',
};

type Color = keyof typeof COLORS;

interface IStatusActionCounter {
  count: number;
}

/** Action button numerical counter, eg "5" likes. */
const StatusActionCounter: React.FC<IStatusActionCounter> = ({ count = 0 }): JSX.Element => {
  return (
    <Text size='xs' weight='semibold' theme='inherit'>
      {shortNumberFormat(count)}
    </Text>
  );
};

interface IStatusActionButton extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  iconClassName?: string;
  icon: string;
  count?: number;
  active?: boolean;
  color?: Color;
  filled?: boolean;
  emoji?: EmojiReaction;
  text?: React.ReactNode;
  theme?: 'default' | 'inverse';
}

const StatusActionButton = forwardRef<HTMLButtonElement, IStatusActionButton>((props, ref): JSX.Element => {
  const { icon, className, iconClassName, active, color, filled = false, count = 0, emoji, text, theme = 'default', ...filteredProps } = props;

  const renderIcon = () => {
    if (emoji) {
      return (
        <span className='flex size-6 items-center justify-center'>
          <Emoji className='size-full p-0.5' emoji={emoji.name} src={emoji.url} />
        </span>
      );
    } else {
      return (
        <Icon
          src={icon}
          className={clsx(
            {
              'fill-accent-300 text-accent-300 hover:fill-accent-300': active && filled && color === COLORS.accent,
            },
            iconClassName,
          )}
        />
      );
    }
  };

  const renderText = () => {
    if (text) {
      return (
        <Text tag='span' theme='inherit' size='sm'>
          {text}
        </Text>
      );
    } else if (count) {
      return (
        <StatusActionCounter count={count} />
      );
    }
  };

  return (
    <button
      ref={ref}
      type='button'
      className={clsx(
        'flex items-center rounded-full p-1 rtl:space-x-reverse',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:ring-offset-0',
        {
          'text-gray-600 hover:text-gray-600 dark:hover:text-white bg-white dark:bg-transparent': theme === 'default',
          'text-white/80 hover:text-white bg-transparent dark:bg-transparent': theme === 'inverse',
          'text-black dark:text-white': active && emoji,
          'hover:text-gray-600 dark:hover:text-white': !filteredProps.disabled,
          'text-accent-300 hover:text-accent-300 dark:hover:text-accent-300': active && !emoji && color === COLORS.accent,
          'text-success-600 hover:text-success-600 dark:hover:text-success-600': active && !emoji && color === COLORS.success,
          'space-x-1': !text,
          'space-x-2': text,
        },
        className,
      )}
      {...filteredProps}
    >
      {renderIcon()}
      {renderText()}
    </button>
  );
});

export default StatusActionButton;
