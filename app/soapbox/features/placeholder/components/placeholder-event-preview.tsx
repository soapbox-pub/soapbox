import React from 'react';

import { Stack, Text } from 'soapbox/components/ui';

import { generateText, randomIntFromInterval } from '../utils';

const PlaceholderEventPreview = () => {
  const eventNameLength = randomIntFromInterval(5, 25);
  const nameLength = randomIntFromInterval(5, 15);

  return (
    <div className='w-full rounded-lg bg-gray-100 dark:bg-primary-800 relative overflow-hidden animate-pulse text-primary-50 dark:text-primary-800'>
      <div className='bg-primary-200 dark:bg-gray-600 h-40' />
      <Stack className='p-2.5' space={2}>
        <Text weight='semibold'>{generateText(eventNameLength)}</Text>

        <div className='flex gap-y-1 gap-x-2 flex-wrap text-gray-700 dark:text-gray-600'>
          <span>{generateText(nameLength)}</span>
          <span>{generateText(nameLength)}</span>
          <span>{generateText(nameLength)}</span>
        </div>
      </Stack>
    </div>
  );
};

export default PlaceholderEventPreview;
