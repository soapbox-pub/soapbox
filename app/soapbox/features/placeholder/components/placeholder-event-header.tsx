import React from 'react';

import { Stack } from 'soapbox/components/ui';

import { generateText, randomIntFromInterval } from '../utils';

const PlaceholderEventHeader = () => {
  const eventNameLength = randomIntFromInterval(5, 25);
  const organizerNameLength = randomIntFromInterval(5, 30);
  const dateLength = randomIntFromInterval(5, 30);
  const locationLength = randomIntFromInterval(5, 30);

  return (
    <Stack className='animate-pulse text-primary-50 dark:text-primary-800' space={2}>
      <p className='text-lg'>{generateText(eventNameLength)}</p>

      <Stack space={1}>
        <p>{generateText(organizerNameLength)}</p>
        <p>{generateText(dateLength)}</p>
        <p>{generateText(locationLength)}</p>
      </Stack>
    </Stack>
  );
};

export default PlaceholderEventHeader;
