import React, { createContext, useContext, useState } from 'react';

import type { IChat } from 'soapbox/queries/chats';

const ChatContext = createContext<any>({
  chat: null,
});

const ChatProvider: React.FC = ({ children }) => {
  const [chat, setChat] = useState<IChat>();

  return (
    <ChatContext.Provider value={{ chat, setChat }}>{children}</ChatContext.Provider>
  );
};

interface IChatContext {
  chat: IChat | null
  setChat: React.Dispatch<React.SetStateAction<IChat | null>>
}

const useChatContext = (): IChatContext => useContext(ChatContext);

export { ChatContext, ChatProvider, useChatContext };
