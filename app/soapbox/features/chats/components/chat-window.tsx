import React from 'react';

import { Avatar, HStack, Icon, Stack, Text } from 'soapbox/components/ui';
import VerificationBadge from 'soapbox/components/verification_badge';
import { IChat } from 'soapbox/queries/chats';

import ChatBox from './chat-box';
import ChatPaneHeader from './chat-pane-header';

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
  );
};

export default ChatWindow;
