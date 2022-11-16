import React from 'react';

import { generateText, randomIntFromInterval } from '../utils';

/** Fake hashtag to display while data is loading. */
const PlaceholderHashtag: React.FC = () => {
  const length = randomIntFromInterval(15, 30);

  return (
    <div className='animate-pulse text-primary-200 dark:text-primary-700'>
      <p>{generateText(length)}</p>
    </div>
  );
};

export default PlaceholderHashtag;
