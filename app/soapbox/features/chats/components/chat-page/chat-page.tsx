import React from 'react';

import { Card, Stack } from 'soapbox/components/ui';

import ChatPageMain from './components/chat-page-main';
import ChatPageSidebar from './components/chat-page-sidebar';

const ChatPage = () => {
  return (
    <Card className='p-0 h-[calc(100vh-176px)] overflow-hidden' variant='rounded'>
      <div className='grid grid-cols-9 overflow-hidden h-full dark:divide-x-2 dark:divide-solid dark:divide-gray-800'>
        <Stack
          className='col-span-3 p-6 bg-gradient-to-r from-white to-gray-100 dark:bg-gray-900 dark:bg-none overflow-hidden dark:inset'
        >
          <ChatPageSidebar />
        </Stack>

        <Stack className='col-span-6 h-full overflow-hidden'>
          <ChatPageMain />
        </Stack>
      </div>
    </Card>
  );
};

export default ChatPage;
