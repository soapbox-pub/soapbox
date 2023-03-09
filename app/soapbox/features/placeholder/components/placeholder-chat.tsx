import React from 'react';

import { HStack, Stack } from 'soapbox/components/ui';

import PlaceholderAvatar from './placeholder-avatar';
import PlaceholderDisplayName from './placeholder-display-name';

/** Fake chat to display while data is loading. */
const PlaceholderChat = () => {
  return (
    <div className='flex w-full animate-pulse flex-col px-4 py-2'>
      <HStack alignItems='center' space={2}>
        <PlaceholderAvatar size={40} />

        <Stack alignItems='start'>
          <PlaceholderDisplayName minLength={3} maxLength={15} />
        </Stack>
      </HStack>
    </div>
  );
};

export default PlaceholderChat;
