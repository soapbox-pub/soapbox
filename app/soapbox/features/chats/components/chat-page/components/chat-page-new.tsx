import React from 'react';
import { useHistory } from 'react-router-dom';

import { CardTitle, HStack, IconButton, Stack } from 'soapbox/components/ui';

import ChatSearch from '../../chat-search/chat-search';

interface IChatPageNew {
}

/** New message form to create a chat. */
const ChatPageNew: React.FC<IChatPageNew> = () => {
  const history = useHistory();

  return (
    <Stack className='h-full space-y-4'>
      <Stack className='flex-grow pt-6 px-4 sm:px-6'>
        <HStack alignItems='center'>
          <IconButton
            src={require('@tabler/icons/arrow-left.svg')}
            className='sm:hidden h-7 w-7 mr-2 sm:mr-0'
            onClick={() => history.push('/chats')}
          />

          <CardTitle title='New Message' />
        </HStack>
      </Stack>

      <ChatSearch isMainPage />
    </Stack>
  );
};

export default ChatPageNew;