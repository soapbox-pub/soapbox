import React from 'react';

import RelativeTimestamp from 'soapbox/components/relative-timestamp';
import { Avatar, HStack, Icon, Stack, Text } from 'soapbox/components/ui';
import VerificationBadge from 'soapbox/components/verification_badge';

import type { IChat, IChatSilence } from 'soapbox/queries/chats';

interface IChatListItemInterface {
  chat: IChat,
  onClick: (chat: any) => void,
  chatSilence?: IChatSilence
}

const ChatListItem: React.FC<IChatListItemInterface> = ({ chat, chatSilence, onClick }) => {
  return (
    <button
      key={chat.id}
      type='button'
      onClick={() => onClick(chat)}
      className='px-4 py-2 w-full flex flex-col hover:bg-gray-100 dark:hover:bg-gray-800 focus:shadow-inset-ring'
      data-testid='chat'
    >
      <HStack alignItems='center' justifyContent='between' space={2} className='w-full'>
        <HStack alignItems='center' space={2} className='overflow-hidden'>
          <Avatar src={chat.account?.avatar} size={40} className='flex-none' />

          <Stack alignItems='start' className='overflow-hidden'>
            <div className='flex items-center space-x-1 flex-grow w-full'>
              <Text weight='bold' size='sm' align='left' truncate>{chat.account?.display_name || `@${chat.account.username}`}</Text>
              {chat.account?.verified && <VerificationBadge />}
            </div>

            {chat.last_message?.content && (
              <Text
                align='left'
                size='sm'
                weight='medium'
                theme='muted'
                truncate
                className='w-full truncate-child pointer-events-none'
                data-testid='chat-last-message'
                dangerouslySetInnerHTML={{ __html: chat.last_message?.content }}
              />
            )}
          </Stack>
        </HStack>

        <HStack alignItems='center' space={2}>
          {chatSilence ? (
            <Icon src={require('@tabler/icons/bell-off.svg')} className='w-5 h-5 text-gray-600' />
          ) : null}

          {chat.last_message && (
            <>
              {chat.last_message.unread && (
                <div
                  className='w-2 h-2 rounded-full bg-secondary-500'
                  data-testid='chat-unread-indicator'
                />
              )}

              <RelativeTimestamp
                timestamp={chat.last_message.created_at}
                align='right'
                size='xs'
                truncate
              />
            </>
          )}
        </HStack>
      </HStack>
    </button>
  );
};

export default ChatListItem;
