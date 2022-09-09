import React, { createContext, useContext, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';

import { toggleMainWindow } from 'soapbox/actions/chats';
import { useOwnAccount, useSettings } from 'soapbox/hooks';

import type { IChat } from 'soapbox/queries/chats';

type WindowState = 'open' | 'minimized';

const ChatContext = createContext<any>({
  chat: null,
  isOpen: false,
  isEditing: false,
  needsAcceptance: false,
});

const ChatProvider: React.FC = ({ children }) => {
  const dispatch = useDispatch();
  const settings = useSettings();
  const account = useOwnAccount();

  const [chat, setChat] = useState<IChat | null>(null);
  const [isEditing, setEditing] = useState<boolean>(false);
  const [isSearching, setSearching] = useState<boolean>(false);

  const mainWindowState = settings.getIn(['chats', 'mainWindow']) as WindowState;
  const needsAcceptance = !chat?.accepted && chat?.created_by_account !== account?.id;
  const isOpen = mainWindowState === 'open';

  const toggleChatPane = () => dispatch(toggleMainWindow());

  const value = useMemo(() => ({
    chat,
    setChat,
    needsAcceptance,
    isOpen,
    isEditing,
    isSearching,
    setEditing,
    setSearching,
    toggleChatPane,
  }), [chat, needsAcceptance, isOpen, isEditing, isSearching]);

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

interface IChatContext {
  chat: IChat | null
  isEditing: boolean
  isOpen: boolean
  isSearching: boolean
  needsAcceptance: boolean
  setChat: React.Dispatch<React.SetStateAction<IChat | null>>
  setEditing: React.Dispatch<React.SetStateAction<boolean>>
  setSearching: React.Dispatch<React.SetStateAction<boolean>>
  toggleChatPane(): void
}

const useChatContext = (): IChatContext => useContext(ChatContext);

export { ChatContext, ChatProvider, useChatContext };
