import React from 'react';

import { ChatProvider } from 'soapbox/contexts/chat-context';

import ChatPage from './components/chat-page/chat-page';

interface IChatIndex {
  params?: {
    chatId?: string
  }
}

const ChatIndex: React.FC<IChatIndex> = ({ params }) => (
  <ChatProvider>
    <ChatPage chatId={params?.chatId} />
  </ChatProvider>
);

export default ChatIndex;
