import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

import {
  closeChat,
  toggleChat,
} from 'soapbox/actions/chats';
import HoverRefWrapper from 'soapbox/components/hover_ref_wrapper';
import IconButton from 'soapbox/components/icon_button';
import { Avatar, HStack, Counter, Icon, Stack, Text } from 'soapbox/components/ui';
import VerificationBadge from 'soapbox/components/verification_badge';
import { useAppSelector, useAppDispatch } from 'soapbox/hooks';
import { IChat } from 'soapbox/queries/chats';
import { makeGetChat } from 'soapbox/selectors';
import { getAcct } from 'soapbox/utils/accounts';
import { displayFqn as getDisplayFqn } from 'soapbox/utils/state';

import ChatBox from './chat-box';
import ChatPaneHeader from './chat-pane-header';
import { Pane, WindowState } from './ui';

import type { Account as AccountEntity } from 'soapbox/types/entities';

const getChat = makeGetChat();

interface IChatWindow {
  chat: IChat
  closeChat(): void
  closePane(): void
}

/** Floating desktop chat window. */
const ChatWindow: React.FC<IChatWindow> = ({ chat, closeChat, closePane }) => {
  if (!chat) return null;

  return (
    <>
      <ChatPaneHeader
        title={
          <HStack alignItems='center' space={2}>
            <button onClick={closeChat}>
              <Icon
                src={require('@tabler/icons/arrow-left.svg')}
                className='h-6 w-6 text-gray-600 dark:text-gray-400'
              />
            </button>

            <HStack alignItems='center' space={3}>
              <Avatar src={chat.account.avatar} size={40} />

              <Stack alignItems='start'>
                <div className='flex items-center space-x-1 flex-grow'>
                  <Text weight='semibold' truncate>{chat.account.display_name}</Text>
                  {chat.account.verified && <VerificationBadge />}
                </div>
                <Text theme='muted' truncate>{chat.account.acct}</Text>
              </Stack>
            </HStack>
          </HStack>
        }
        isToggleable={false}
        isOpen
        onToggle={closePane}
      />

      <Stack className='overflow-hidden flex-grow h-full' space={2}>
        <ChatBox chat={chat} onSetInputRef={() => null} />
      </Stack>
    </>
    // <Pane windowState={windowState} index={idx}>
    //   <HStack space={2} className='pane__header'>
    //     {unreadCount > 0 ? unreadIcon : avatar }
    //     <button className='pane__title' onClick={handleChatToggle(chat.id)}>
    //       @{getAcct(account, displayFqn)}
    //     </button>
    //     <div className='pane__close'>
    //       <IconButton src={require('@tabler/icons/x.svg')} title='Close chat' onClick={handleChatClose(chat.id)} />
    //     </div>
    //   </HStack>
    //   <div className='pane__content'>
    //     <ChatBox
    //       chatId={chat.id}
    //
    //     />
    //   </div>
    // </Pane>
  );
};

export default ChatWindow;
