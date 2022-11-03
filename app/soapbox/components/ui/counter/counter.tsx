import React from 'react';

import { shortNumberFormat } from 'soapbox/utils/numbers';

interface ICounter {
  /** Number this counter should display. */
  count: number,
  /** Optional max number (ie: N+) */
  countMax?: number
}

/** A simple counter for notifications, etc. */
const Counter: React.FC<ICounter> = ({ count, countMax }) => {
  return (
    <span className='block px-1.5 py-0.5 bg-secondary-500 text-xs font-semibold text-white rounded-full ring-2 ring-white dark:ring-gray-800'>
      {shortNumberFormat(count, countMax)}
    </span>
  );
};

export default Counter;
