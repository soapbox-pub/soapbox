import React from 'react';

import { CardTitle, Stack } from 'soapbox/components/ui';

interface IChatPageNew {
}

/** New message form to create a chat. */
const ChatPageNew: React.FC<IChatPageNew> = () => {
  return (
    <Stack className='h-full p-6 space-y-8'>
      <CardTitle title='New Message' />
    </Stack>
  );
};

export default ChatPageNew;