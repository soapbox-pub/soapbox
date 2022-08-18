import React from 'react';

import { ChatProvider } from 'soapbox/contexts/chat-context';

import ChatPane from './chat-pane/chat-pane';

const ChatWidget = () => {
  return (
    <ChatProvider>
      <ChatPane />
    </ChatProvider>
  );
};

export default ChatWidget;
