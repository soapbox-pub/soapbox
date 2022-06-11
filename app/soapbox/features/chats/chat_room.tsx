import { Map as ImmutableMap } from 'immutable';
import React, { useEffect, useRef } from 'react';

import { fetchChat, markChatRead } from 'soapbox/actions/chats';
import { Column } from 'soapbox/components/ui';
import { useAppSelector, useAppDispatch } from 'soapbox/hooks';
import { makeGetChat } from 'soapbox/selectors';
import { getAcct } from 'soapbox/utils/accounts';
import { displayFqn as getDisplayFqn } from 'soapbox/utils/state';

import ChatBox from './components/chat_box';

const getChat = makeGetChat();

interface IChatRoom {
  params: {
    chatId: string,
  }
}

const ChatRoom: React.FC<IChatRoom> = ({ params }) => {
  const dispatch = useAppDispatch();

  const displayFqn = useAppSelector(getDisplayFqn);
  const chat = useAppSelector(state => {
    const chat = state.chats.items.get(params.chatId, ImmutableMap()).toJS();
    return getChat(state, chat as any);
  });

  const inputElem = useRef<HTMLInputElement | null>(null);

  const handleInputRef = (el: HTMLInputElement) => {
    inputElem.current = el;
    focusInput();
  };

  const focusInput = () => {
    inputElem.current?.focus();
  };

  const markRead = () => {
    if (chat) {
      dispatch(markChatRead(chat.id));
    }
  };

  useEffect(() => {
    dispatch(fetchChat(params.chatId));
    markRead();
  }, []);

  useEffect(() => {
    const markReadConditions = [
      () => chat,
      () => chat ? chat.unread > 0 : false,
    ];

    if (markReadConditions.every(c => c()))
      markRead();
  });

  if (!chat) return null;
  const { account } = chat;

  return (
    <Column label={`@${getAcct(account as any, displayFqn)}`}>
      <ChatBox
        chatId={chat.id}
        onSetInputRef={handleInputRef}
      />
    </Column>
  );
};

export default ChatRoom;
