import React from 'react';

import { randomIntFromInterval, generateText } from '../utils';

interface IPlaceholderDisplayName {
  maxLength: number,
  minLength: number,
  withSuffix?: boolean,
}

/** Fake display name to show when data is loading. */
const PlaceholderDisplayName: React.FC<IPlaceholderDisplayName> = ({ minLength, maxLength, withSuffix = true }) => {
  const length = randomIntFromInterval(maxLength, minLength);
  const acctLength = randomIntFromInterval(maxLength, minLength);

  return (
    <div className='text-primary-50 dark:text-primary-800 flex flex-col'>
      <p>{generateText(length)}</p>
      {withSuffix && <p>{generateText(acctLength)}</p>}
    </div>
  );
};

export default PlaceholderDisplayName;
