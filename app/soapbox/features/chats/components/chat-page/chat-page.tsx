import classNames from 'clsx';
import React, { useEffect, useRef, useState } from 'react';
import { Route, Switch } from 'react-router-dom';

import { Stack } from 'soapbox/components/ui';
import { useChatContext } from 'soapbox/contexts/chat-context';
import { useChat } from 'soapbox/queries/chats';

import ChatPageMain from './components/chat-page-main';
import ChatPageNew from './components/chat-page-new';
import ChatPageSidebar from './components/chat-page-sidebar';
import Welcome from './components/welcome';

interface IChatPage {
  chatId?: string,
}

const ChatPage: React.FC<IChatPage> = ({ chatId }) => {
  const { chat, setChat } = useChatContext();
  const { chat: chatQueryResult } = useChat(chatId);

  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<string | number>('100%');

  const calculateHeight = () => {
    if (!containerRef.current) {
      return null;
    }

    const { top } = containerRef.current.getBoundingClientRect();
    const fullHeight = document.body.offsetHeight;

    // On mobile, account for bottom navigation.
    const offset = document.body.clientWidth < 976 ? -61 : 0;

    setHeight(fullHeight - top + offset);
  };

  useEffect(() => {
    const data = chatQueryResult?.data;

    if (data) {
      setChat(data);
    }
  }, [chatQueryResult?.isLoading]);

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
          <Switch>
            <Route path='/chats/new'>
              <ChatPageNew />
            </Route>
            <Route path='/chats/settings'>
              <Welcome />
            </Route>
            <Route>
              <ChatPageMain />
            </Route>
          </Switch>
        </Stack>
      </div>
    </div>
  );
};

export default ChatPage;
