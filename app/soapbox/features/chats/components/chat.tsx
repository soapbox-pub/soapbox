import React from 'react';

import { Avatar, HStack, Stack, Text } from 'soapbox/components/ui';
import VerificationBadge from 'soapbox/components/verification_badge';

import type { IChat } from 'soapbox/queries/chats';

interface IChatInterface {
  chat: IChat,
  onClick: (chat: any) => void,
}

const Chat: React.FC<IChatInterface> = ({ chat, onClick }) => {
  return (
    <button
      key={chat.id}
      type='button'
      onClick={() => onClick(chat)}
      className='px-4 py-2 w-full flex flex-col hover:bg-gray-100 dark:hover:bg-gray-800'
    >
      <HStack alignItems='center' space={2}>
        <Avatar src={chat.account?.avatar} size={40} />

        <Stack alignItems='start'>
          <div className='flex items-center space-x-1 flex-grow'>
            <Text weight='bold' size='sm' truncate>{chat.account?.display_name}</Text>
            {chat.account?.verified && <VerificationBadge />}
          </div>
          <Text size='sm' weight='medium' theme='muted' truncate>@{chat.account?.acct}</Text>
        </Stack>
      </HStack>
    </button>
  );
};

export default Chat;
