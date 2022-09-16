import React from 'react';

import { ChatProvider } from 'soapbox/contexts/chat-context';

import ChatPage from './components/chat-page/chat-page';

const ChatIndex: React.FC = () => (
  <ChatProvider>
    <ChatPage />
  </ChatProvider>
);

export default ChatIndex;
