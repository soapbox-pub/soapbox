import arrowBarToUpIcon from '@tabler/icons/outline/arrow-bar-to-up.svg';
import { throttle } from 'es-toolkit';
import { useState, useEffect, useCallback } from 'react';
import { useIntl, MessageDescriptor } from 'react-intl';

import Icon from 'soapbox/components/ui/icon.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import { useSettings } from 'soapbox/hooks/useSettings.ts';

interface IScrollTopButton {
  /** Callback when clicked, and also when scrolled to the top. */
  onClick: () => void;
  /** Number of unread items. */
  count: number;
  /** Message to display in the button (should contain a `{count}` value). */
  message: MessageDescriptor;
  /** Distance from the top of the screen (scrolling down) before the button appears. */
  threshold?: number;
  /** Distance from the top of the screen (scrolling up) before the action is triggered. */
  autoloadThreshold?: number;
}

/** Floating new post counter above timelines, clicked to scroll to top. */
const ScrollTopButton: React.FC<IScrollTopButton> = ({
  onClick,
  count,
  message,
  threshold = 400,
  autoloadThreshold = 50,
}) => {
  const intl = useIntl();
  const { autoloadTimelines } = useSettings();

  // Whether we are scrolled past the `threshold`.
  const [scrolled, setScrolled] = useState<boolean>(false);
  // Whether we are scrolled above the `autoloadThreshold`.
  const [scrolledTop, setScrolledTop] = useState<boolean>(false);

  const visible = count > 0 && scrolled;

  /** Number of pixels scrolled down from the top of the page. */
  const getScrollTop = (): number => {
    return (document.scrollingElement || document.documentElement).scrollTop;
  };

  /** Unload feed items if scrolled to the top. */
  const maybeUnload = useCallback(() => {
    if (autoloadTimelines && scrolledTop && count) {
      onClick();
    }
  }, [autoloadTimelines, scrolledTop, count, onClick]);

  /** Set state while scrolling. */
  const handleScroll = useCallback(throttle(() => {
    const scrollTop = getScrollTop();

    setScrolled(scrollTop > threshold);
    setScrolledTop(scrollTop <= autoloadThreshold);

  }, 150, { edges: ['trailing'] }), [threshold, autoloadThreshold]);

  /** Scroll to top and trigger `onClick`. */
  const handleClick: React.MouseEventHandler = useCallback(() => {
    window.scrollTo({ top: 0 });
    onClick();
  }, [onClick]);

  useEffect(() => {
    // Delay adding the scroll listener so navigating back doesn't
    // unload feed items before the feed is rendered.
    setTimeout(() => {
      window.addEventListener('scroll', handleScroll);
      handleScroll();
    }, 250);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  useEffect(() => {
    maybeUnload();
  }, [maybeUnload]);

  if (!visible) {
    return null;
  }

  return (
    <div className='fixed left-1/2 top-28 z-50 -translate-x-1/2'>
      <button
        className='flex cursor-pointer items-center space-x-1.5 whitespace-nowrap rounded-full bg-primary-600 px-4 py-2 text-white transition-transform hover:scale-105 hover:bg-primary-700 active:scale-100'
        onClick={handleClick}
      >
        <Icon
          className='size-4'
          src={arrowBarToUpIcon}
        />

        <Text theme='inherit' size='sm'>
          {intl.formatMessage(message, { count })}
        </Text>
      </button>
    </div>
  );
};

export default ScrollTopButton;
