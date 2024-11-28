import chevronRightIcon from '@tabler/icons/outline/chevron-right.svg';
import clsx from 'clsx';
import { useState, useRef, useLayoutEffect, useMemo, memo } from 'react';
import { FormattedMessage } from 'react-intl';

import Icon from 'soapbox/components/icon.tsx';
import { isOnlyEmoji as _isOnlyEmoji } from 'soapbox/utils/only-emoji.ts';
import { getTextDirection } from 'soapbox/utils/rtl.ts';

import Markup from './markup.tsx';
import Poll from './polls/poll.tsx';

import type { Sizes } from 'soapbox/components/ui/text.tsx';
import type { Status } from 'soapbox/types/entities.ts';

const MAX_HEIGHT = 642; // 20px * 32 (+ 2px padding at the top)

interface IReadMoreButton {
  onClick: React.MouseEventHandler;
}

/** Button to expand a truncated status (due to too much content) */
const ReadMoreButton: React.FC<IReadMoreButton> = ({ onClick }) => (
  <button className='flex items-center border-0 bg-transparent p-0 pt-2 text-gray-900 hover:underline active:underline dark:text-gray-300' onClick={onClick}>
    <FormattedMessage id='status.read_more' defaultMessage='Read more' />
    <Icon className='inline-block size-5' src={chevronRightIcon} />
  </button>
);

interface IStatusContent {
  status: Status;
  onClick?: () => void;
  collapsable?: boolean;
  translatable?: boolean;
  textSize?: Sizes;
}

/** Renders the text content of a status */
const StatusContent: React.FC<IStatusContent> = ({
  status,
  onClick,
  collapsable = false,
  translatable,
  textSize = 'md',
}) => {
  const [collapsed, setCollapsed] = useState(false);

  const node = useRef<HTMLDivElement>(null);
  const isOnlyEmoji = useMemo(() => _isOnlyEmoji(status.content, status.emojis.toJS(), 10), [status.content]);

  const maybeSetCollapsed = (): void => {
    if (!node.current) return;

    if (collapsable && onClick && !collapsed) {
      if (node.current.clientHeight > MAX_HEIGHT) {
        setCollapsed(true);
      }
    }
  };

  useLayoutEffect(() => {
    maybeSetCollapsed();
  });

  const parsedHtml = useMemo((): string => {
    return translatable && status.translation ? status.translation.get('content')! : status.content;
  }, [status.content, status.translation]);

  if (status.content.length === 0) {
    return null;
  }

  const withSpoiler = status.spoiler_text.length > 0;

  const baseClassName = 'text-gray-900 dark:text-gray-100 break-words text-ellipsis overflow-hidden relative focus:outline-none';

  const direction = getTextDirection(status.search_index);
  const className = clsx(baseClassName, {
    'cursor-pointer': onClick,
    'whitespace-normal': withSpoiler,
    'max-h-[300px]': collapsed,
    'leading-normal !text-4xl': isOnlyEmoji,
  });

  if (onClick) {
    const output = [
      <Markup
        ref={node}
        tabIndex={0}
        key='content'
        className={className}
        direction={direction}
        lang={status.language || undefined}
        size={textSize}
        emojis={status.emojis.toJS()}
        mentions={status.mentions.toJS()}
        html={{ __html: parsedHtml }}
      />,
    ];

    if (collapsed) {
      output.push(<ReadMoreButton onClick={onClick} key='read-more' />);
    }

    const hasPoll = status.poll && typeof status.poll === 'string';
    if (hasPoll) {
      output.push(<Poll id={status.poll} key='poll' status={status.url} />);
    }

    return <div className={clsx({ 'bg-gray-100 dark:bg-primary-800 rounded-md p-4': hasPoll })}>{output}</div>;
  } else {
    const output = [
      <Markup
        ref={node}
        tabIndex={0}
        key='content'
        className={clsx(baseClassName, {
          'leading-normal !text-4xl': isOnlyEmoji,
        })}
        direction={direction}
        lang={status.language || undefined}
        size={textSize}
        emojis={status.emojis.toJS()}
        mentions={status.mentions.toJS()}
        html={{ __html: parsedHtml }}
      />,
    ];

    if (status.poll && typeof status.poll === 'string') {
      output.push(<Poll id={status.poll} key='poll' status={status.url} />);
    }

    return <>{output}</>;
  }
};

export default memo(StatusContent);
