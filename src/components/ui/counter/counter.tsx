import React from 'react';

import { shortNumberFormat } from 'soapbox/utils/numbers';

interface ICounter {
  /** Number this counter should display. */
  count: number
  /** Optional max number (ie: N+) */
  countMax?: number
}

/** A simple counter for notifications, etc. */
const Counter: React.FC<ICounter> = ({ count, countMax }) => {
  return (
    <span className='flex h-5 min-w-[20px] max-w-[26px] items-center justify-center rounded-full bg-secondary-500 text-xs font-medium text-white ring-2 ring-white dark:ring-gray-800'>
      {shortNumberFormat(count, countMax)}
    </span>
  );
};

export default Counter;
