import React, { useEffect } from 'react';

import { connectDirectStream } from 'soapbox/actions/streaming';
import { ChatProvider } from 'soapbox/contexts/chat-context';
import { useAppDispatch, useOwnAccount } from 'soapbox/hooks';

import ChatPane from './chat-pane/chat-pane';

const ChatWidget = () => {
  const account = useOwnAccount();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const disconnect = dispatch(connectDirectStream());

    return (() => {
      disconnect();
    });
  }, []);

  if (!account?.chats_onboarded) {
    return null;
  }

  return (
    <ChatProvider>
      <ChatPane />
    </ChatProvider>
  );
};

export default ChatWidget;
