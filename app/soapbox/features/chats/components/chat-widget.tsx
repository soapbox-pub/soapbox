import React, { useEffect } from 'react';

import { connectDirectStream } from 'soapbox/actions/streaming';
import { ChatProvider } from 'soapbox/contexts/chat-context';
import { useAppDispatch } from 'soapbox/hooks';

import ChatPane from './chat-pane/chat-pane';

const ChatWidget = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const disconnect = dispatch(connectDirectStream());

    return (() => {
      disconnect();
    });
  }, []);

  return (
    <ChatProvider>
      <ChatPane />
    </ChatProvider>
  );
};

export default ChatWidget;
