import chevronRightIcon from '@tabler/icons/outline/chevron-right.svg';
import clsx from 'clsx';
import graphemesplit from 'graphemesplit';
import parse, { Element, type HTMLReactParserOptions, domToReact, type DOMNode, Text as DOMText } from 'html-react-parser';
import { useState, useRef, useLayoutEffect, useMemo, memo } from 'react';
import { FormattedMessage } from 'react-intl';

import { useCustomEmojis } from 'soapbox/api/hooks/useCustomEmojis.ts';
import Icon from 'soapbox/components/icon.tsx';

import { getTextDirection } from '../utils/rtl.ts';

import HashtagLink from './hashtag-link.tsx';
import Markup from './markup.tsx';
import Mention from './mention.tsx';
import Poll from './polls/poll.tsx';

import type { Sizes } from 'soapbox/components/ui/text.tsx';
import type { Status } from 'soapbox/types/entities.ts';

const MAX_HEIGHT = 642; // 20px * 32 (+ 2px padding at the top)
const BIG_EMOJI_LIMIT = 10;

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
  const { customEmojis } = useCustomEmojis();

  const isOnlyEmoji = useMemo(() => {
    const textContent = new DOMParser().parseFromString(status.content, 'text/html').body.firstChild?.textContent ?? '';
    return Boolean(/^\p{Extended_Pictographic}+$/u.test(textContent) && (graphemesplit(textContent).length <= BIG_EMOJI_LIMIT));
  }, [status.content]);

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

  const options: HTMLReactParserOptions = {
    replace(domNode) {
      if (domNode instanceof Element && ['script', 'iframe'].includes(domNode.name)) {
        return null;
      }

      if (domNode instanceof DOMText) {
        const parts = domNode.data.split(' ').map((part) => {
          const match = part.match(/^:(\w+):$/);
          if (!match) return part;

          const [, shortcode] = match;
          const customEmoji = customEmojis.find((e) => e.shortcode === shortcode);

          if (!customEmoji) return part;

          return <img key={part} src={customEmoji.url} alt={part} className='inline-block h-[1em]' />;
        });

        return <>{parts}</>;
      }

      if (domNode instanceof Element && domNode.name === 'a') {
        const classes = domNode.attribs.class?.split(' ');

        if (classes?.includes('hashtag')) {
          const child = domToReact(domNode.children as DOMNode[]);

          const hashtag: string | undefined = (() => {
            // Mastodon wraps the hashtag in a span, with a sibling text node containing the hashtag.
            if (Array.isArray(child) && child.length) {
              if (child[0]?.props?.children === '#' && typeof child[1] === 'string') {
                return child[1];
              }
            }
            // Pleroma renders a string directly inside the hashtag link.
            if (typeof child === 'string') {
              return child.replace(/^#/, '');
            }
          })();

          if (hashtag) {
            return <HashtagLink hashtag={hashtag} />;
          }
        }

        if (classes?.includes('mention')) {
          const mention = status.mentions.find(({ url }) => domNode.attribs.href === url);
          if (mention) {
            return <Mention mention={mention} />;
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
            {domToReact(domNode.children as DOMNode[], options)}
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
          'leading-normal !text-4xl': isOnlyEmoji,
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

export default memo(StatusContent);
