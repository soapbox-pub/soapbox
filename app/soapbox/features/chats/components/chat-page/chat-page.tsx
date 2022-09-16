import React from 'react';

import { Card } from 'soapbox/components/ui';

import ChatPageMain from './components/chat-page-main';
import ChatPageSidebar from './components/chat-page-sidebar';

const ChatPage = () => {
  return (
    <Card className='p-0 h-[calc(100vh-176px)] overflow-hidden' variant='rounded'>
      <div className='grid grid-cols-9 overflow-hidden h-full dark:divide-x-2 dark:divide-solid dark:divide-gray-800'>
        <ChatPageSidebar />
        <ChatPageMain />
      </div>
    </Card>
  );
};

export default ChatPage;
