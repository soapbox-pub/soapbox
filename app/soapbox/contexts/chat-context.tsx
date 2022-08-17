import React, { createContext, useContext, useState } from 'react';
import { useDispatch } from 'react-redux';

import { toggleMainWindow } from 'soapbox/actions/chats';
import { useSettings } from 'soapbox/hooks';

import type { IChat } from 'soapbox/queries/chats';

type WindowState = 'open' | 'minimized';

const ChatContext = createContext<any>({
  chat: null,
  isOpen: false,
  isEditing: false,
});

const ChatProvider: React.FC = ({ children }) => {
  const dispatch = useDispatch();
  const settings = useSettings();

  const [chat, setChat] = useState<IChat | null>(null);
  const [isEditing, setEditing] = useState<boolean>(false);

  const mainWindowState = settings.getIn(['chats', 'mainWindow']) as WindowState;

  const isOpen = mainWindowState === 'open';

  const toggleChatPane = () => dispatch(toggleMainWindow());

  return (
    <ChatContext.Provider value={{ chat, setChat, isOpen, isEditing, setEditing, toggleChatPane }}>
      {children}
    </ChatContext.Provider>
  );
};

interface IChatContext {
  chat: IChat | null
  isOpen: boolean
  isEditing: boolean
  setChat: React.Dispatch<React.SetStateAction<IChat | null>>
  setEditing: React.Dispatch<React.SetStateAction<boolean>>
  toggleChatPane(): void
}

const useChatContext = (): IChatContext => useContext(ChatContext);

export { ChatContext, ChatProvider, useChatContext };
