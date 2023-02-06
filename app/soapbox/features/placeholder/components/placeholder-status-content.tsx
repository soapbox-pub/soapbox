import React from 'react';

import { randomIntFromInterval, generateText } from '../utils';

interface IPlaceholderStatusContent {
  maxLength: number,
  minLength: number,
}

/** Fake status content while data is loading. */
const PlaceholderStatusContent: React.FC<IPlaceholderStatusContent> = ({ minLength, maxLength }) => {
  const length = randomIntFromInterval(maxLength, minLength);

  return (
    <div className='text-primary-50 dark:text-primary-800 flex flex-col'>
      <p className='break-words'>{generateText(length)}</p>
    </div>
  );
};

export default PlaceholderStatusContent;
