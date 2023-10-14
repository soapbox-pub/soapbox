import clsx from 'clsx';
import parse, { Element, type HTMLReactParserOptions, domToReact } from 'html-react-parser';
import React, { useState, useRef, useLayoutEffect, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';

import Icon from 'soapbox/components/icon';
import { onlyEmoji as isOnlyEmoji } from 'soapbox/utils/rich-content';

import { getTextDirection } from '../utils/rtl';

import HashtagLink from './hashtag-link';
import Markup from './markup';
import Mention from './mention';
import Poll from './polls/poll';

import type { Sizes } from 'soapbox/components/ui/text/text';
import type { Status } from 'soapbox/types/entities';

const MAX_HEIGHT = 642; // 20px * 32 (+ 2px padding at the top)
const BIG_EMOJI_LIMIT = 10;

interface IReadMoreButton {
  onClick: React.MouseEventHandler;
}

/** Button to expand a truncated status (due to too much content) */
const ReadMoreButton: React.FC<IReadMoreButton> = ({ onClick }) => (
  <button className='flex items-center border-0 bg-transparent p-0 pt-2 text-gray-900 hover:underline active:underline dark:text-gray-300' onClick={onClick}>
    <FormattedMessage id='status.read_more' defaultMessage='Read more' />
    <Icon className='inline-block h-5 w-5' src={require('@tabler/icons/chevron-right.svg')} />
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
  const [onlyEmoji, setOnlyEmoji] = useState(false);

  const node = useRef<HTMLDivElement>(null);

  const maybeSetCollapsed = (): void => {
    if (!node.current) return;

    if (collapsable && onClick && !collapsed) {
      if (node.current.clientHeight > MAX_HEIGHT) {
        setCollapsed(true);
      }
    }
  };

  const maybeSetOnlyEmoji = (): void => {
    if (!node.current) return;
    const only = isOnlyEmoji(node.current, BIG_EMOJI_LIMIT, true);

    if (only !== onlyEmoji) {
      setOnlyEmoji(only);
    }
  };

  useLayoutEffect(() => {
    maybeSetCollapsed();
    maybeSetOnlyEmoji();
  });

  const parsedHtml = useMemo((): string => {
    return translatable && status.translation ? status.translation.get('content')! : status.contentHtml;
  }, [status.contentHtml, status.translation]);

  if (status.content.length === 0) {
    return null;
  }

  const withSpoiler = status.spoiler_text.length > 0;

  const baseClassName = 'text-gray-900 dark:text-gray-100 break-words text-ellipsis overflow-hidden relative focus:outline-none';

  const options: HTMLReactParserOptions = {
    replace(domNode) {
      if (domNode instanceof Element && ['script', 'iframe'].includes(domNode.name)) {
        return null;
      }

      if (domNode instanceof Element && domNode.name === 'a') {
        const classes = domNode.attribs.class?.split(' ');

        if (classes?.includes('mention')) {
          const mention = status.mentions.find(({ url }) => domNode.attribs.href === url);
          if (mention) {
            return <Mention mention={mention} />;
          }
        }

        if (classes?.includes('hashtag')) {
          const child = domToReact(domNode.children);
          const hashtag = typeof child === 'string' ? child.replace(/^#/, '') : undefined;
          if (hashtag) {
            return <HashtagLink hashtag={hashtag} />;
          }
        }

        return (
          // eslint-disable-next-line jsx-a11y/no-static-element-interactions
          <a
            {...domNode.attribs}
            onClick={(e) => e.stopPropagation()}
            rel='nofollow noopener'
            target='_blank'
            title={domNode.attribs.href}
          >
            {domToReact(domNode.children, options)}
          </a>
        );
      }
    },
  };

  const content = parse(parsedHtml, options);

  const direction = getTextDirection(status.search_index);
  const className = clsx(baseClassName, {
    'cursor-pointer': onClick,
    'whitespace-normal': withSpoiler,
    'max-h-[300px]': collapsed,
    'leading-normal big-emoji': onlyEmoji,
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
      >
        {content}
      </Markup>,
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
          'leading-normal big-emoji': onlyEmoji,
        })}
        direction={direction}
        lang={status.language || undefined}
        size={textSize}
      >
        {content}
      </Markup>,
    ];

    if (status.poll && typeof status.poll === 'string') {
      output.push(<Poll id={status.poll} key='poll' status={status.url} />);
    }

    return <>{output}</>;
  }
};

export default React.memo(StatusContent);
