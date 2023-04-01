import React from 'react';

import { HStack, Stack, Text } from 'soapbox/components/ui';

import { generateText, randomIntFromInterval } from '../utils';

const PlaceholderGroupDiscover = () => {
  const groupNameLength = randomIntFromInterval(12, 20);

  return (
    <Stack space={2} className='animate-pulse'>
      <Stack className='aspect-h-7 aspect-w-10 h-full w-full overflow-hidden rounded-lg'>
        {/* Group Cover Image */}
        <div className='absolute inset-0 rounded-t-lg bg-gray-300 object-cover dark:bg-gray-800' />

        <Stack justifyContent='end' className='z-10 p-4 text-gray-900 dark:text-gray-100' space={3}>
          {/* Group Avatar */}
          <div className='h-11 w-11 rounded-full bg-gray-500 dark:bg-gray-700 dark:ring-primary-900' />

          {/* Group Info */}
          <Stack space={1} className='text-gray-500 dark:text-gray-700'>
            <Text theme='inherit' weight='bold' truncate>{generateText(groupNameLength)}</Text>

            <HStack space={3} wrap>
              <Text tag='span' theme='inherit'>{generateText(6)}</Text>
              <Text tag='span' theme='inherit'>{generateText(6)}</Text>
            </HStack>
          </Stack>
        </Stack>
      </Stack>

      {/* Join Group Button */}
      <div className='h-10 w-full rounded-full bg-gray-300 dark:bg-gray-800' />
    </Stack>
  );
};

export default PlaceholderGroupDiscover;
