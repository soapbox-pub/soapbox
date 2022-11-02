import React, { createContext, useContext, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';

import { toggleMainWindow } from 'soapbox/actions/chats';
import { useOwnAccount, useSettings } from 'soapbox/hooks';
import { IChat, useChat } from 'soapbox/queries/chats';

type WindowState = 'open' | 'minimized';

const ChatContext = createContext<any>({
  isOpen: false,
  needsAcceptance: false,
});

enum ChatWidgetScreens {
  INBOX = 'INBOX',
  SEARCH = 'SEARCH',
  CHAT = 'CHAT',
  CHAT_SETTINGS = 'CHAT_SETTINGS'
}

const ChatProvider: React.FC = ({ children }) => {
  const dispatch = useDispatch();
  const settings = useSettings();
  const account = useOwnAccount();

  const [screen, setScreen] = useState<ChatWidgetScreens>(ChatWidgetScreens.INBOX);
  const [currentChatId, setCurrentChatId] = useState<null | string>(null);

  const { data: chat } = useChat(currentChatId as string);

  const mainWindowState = settings.getIn(['chats', 'mainWindow']) as WindowState;
  const needsAcceptance = !chat?.accepted && chat?.created_by_account !== account?.id;
  const isOpen = mainWindowState === 'open';

  const changeScreen = (screen: ChatWidgetScreens, currentChatId?: string | null) => {
    setCurrentChatId(currentChatId || null);
    setScreen(screen);
  };

  const toggleChatPane = () => dispatch(toggleMainWindow());

  const value = useMemo(() => ({
    chat,
    needsAcceptance,
    isOpen,
    toggleChatPane,
    screen,
    changeScreen,
    currentChatId,
  }), [chat, currentChatId, needsAcceptance, isOpen, screen, changeScreen]);

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

interface IChatContext {
  chat: IChat | null
  isOpen: boolean
  needsAcceptance: boolean
  toggleChatPane(): void
  screen: ChatWidgetScreens
  currentChatId: string | null
  changeScreen(screen: ChatWidgetScreens, currentChatId?: string | null): void
}

const useChatContext = (): IChatContext => useContext(ChatContext);

export { ChatContext, ChatProvider, useChatContext, ChatWidgetScreens };
