import React from 'react';

import { Stack } from 'soapbox/components/ui';

import { randomIntFromInterval, generateText } from '../utils';

export default ({ limit }: { limit: number }) => {
  const trend = randomIntFromInterval(6, 3);
  const stat = randomIntFromInterval(10, 3);

  return (
    <>
      {new Array(limit).fill(undefined).map((_, idx) => (
        <Stack key={idx} className='animate-pulse text-primary-200 dark:text-primary-700'>
          <p>{generateText(trend)}</p>
          <p>{generateText(stat)}</p>
        </Stack>
      ))}
    </>
  );
};