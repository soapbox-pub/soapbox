import React from 'react';

import { ChatProvider } from 'soapbox/contexts/chat-context';
import { useOwnAccount } from 'soapbox/hooks';

import ChatPane from './chat-pane/chat-pane';

const ChatWidget = () => {
  const account = useOwnAccount();

  const path = location.pathname;
  const shouldHideWidget = Boolean(path.match(/^\/chats/));

  if (!account?.chats_onboarded || shouldHideWidget) {
    return null;
  }

  return (
    <ChatProvider>
      <ChatPane />
    </ChatProvider>
  );
};

export default ChatWidget;
