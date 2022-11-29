import React from 'react';

import { HStack, Stack } from 'soapbox/components/ui';

import { randomIntFromInterval, generateText } from '../utils';

import PlaceholderAvatar from './placeholder-avatar';
import PlaceholderDisplayName from './placeholder-display-name';

/** Fake chat to display while data is loading. */
const PlaceholderChat: React.FC = () => {
  const messageLength = randomIntFromInterval(5, 75);

  return (
    <div className='account chat-list-item--placeholder'>
      <HStack space={3}>
        <PlaceholderAvatar size={36} />
        <Stack className='overflow-hidden'>
          <PlaceholderDisplayName minLength={3} maxLength={25} withSuffix={false} />
          <span className='overflow-hidden text-ellipsis whitespace-nowrap text-primary-50 dark:text-primary-800'>
            {generateText(messageLength)}
          </span>
        </Stack>
      </HStack>
    </div>
  );
};

export default PlaceholderChat;
