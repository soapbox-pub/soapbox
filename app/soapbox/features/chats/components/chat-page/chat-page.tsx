import classNames from 'clsx';
import React, { useEffect, useRef, useState } from 'react';

import { Stack } from 'soapbox/components/ui';
import { useChatContext } from 'soapbox/contexts/chat-context';

import ChatPageMain from './components/chat-page-main';
import ChatPageSidebar from './components/chat-page-sidebar';

const ChatPage = () => {
  const { chat } = useChatContext();

  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<string | number>('100%');

  const calculateHeight = () => {
    if (!containerRef.current) {
      return null;
    }

    const { top } = containerRef.current.getBoundingClientRect();
    const fullHeight = document.body.offsetHeight;

    setHeight(fullHeight - top);
  };

  useEffect(() => {
    calculateHeight();
  }, [containerRef.current]);

  useEffect(() => {
    window.addEventListener('resize', calculateHeight);

    return () => {
      window.removeEventListener('resize', calculateHeight);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ height }}
      className='h-screen bg-white dark:bg-primary-900 text-gray-900 dark:text-gray-100 shadow-lg dark:shadow-none overflow-hidden sm:rounded-t-xl'
    >
      <div className='grid grid-cols-9 overflow-hidden h-full dark:divide-x-2 dark:divide-solid dark:divide-gray-800'>
        <Stack
          className={classNames('col-span-9 sm:col-span-3 bg-gradient-to-r from-white to-gray-100 dark:bg-gray-900 dark:bg-none overflow-hidden dark:inset', {
            'hidden sm:block': chat,
          })}
        >
          <ChatPageSidebar />
        </Stack>

        <Stack className={classNames('col-span-9 sm:col-span-6 h-full overflow-hidden', {
          'hidden sm:block': !chat,
        })}
        >
          <ChatPageMain />
        </Stack>
      </div>
    </div>
  );
};

export default ChatPage;
