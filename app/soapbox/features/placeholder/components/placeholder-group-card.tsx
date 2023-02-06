import React from 'react';

import { HStack, Stack, Text } from 'soapbox/components/ui';

import { generateText, randomIntFromInterval } from '../utils';

const PlaceholderGroupCard = () => {
  const groupNameLength = randomIntFromInterval(5, 25);
  const roleLength = randomIntFromInterval(5, 15);
  const privacyLength = randomIntFromInterval(5, 15);

  return (
    <div className='animate-pulse overflow-hidden'>
      <Stack className='dark:border-primary-800 dark:bg-primary-900 rounded-lg border border-solid border-gray-300 bg-white sm:rounded-xl'>
        <div className='bg-primary-100 relative -m-[1px] mb-0 h-[120px] rounded-t-lg dark:bg-gray-800 sm:rounded-t-xl'>
          <div className='absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2'>
            <div className='bg-primary-500 dark:ring-primary-900 h-16 w-16 rounded-full ring-2 ring-white' />
          </div>
        </div>
        <Stack className='p-3 pt-9' alignItems='center' space={3}>
          <Text size='lg' weight='bold'>{generateText(groupNameLength)}</Text>
          <HStack className='text-gray-700 dark:text-gray-600' space={3} wrap>
            <span>{generateText(roleLength)}</span>
            <span>{generateText(privacyLength)}</span>
          </HStack>
        </Stack>
      </Stack>
    </div>
  );
};

export default PlaceholderGroupCard;
