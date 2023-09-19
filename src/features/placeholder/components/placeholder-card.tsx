import clsx from 'clsx';
import React from 'react';

import { randomIntFromInterval, generateText } from '../utils';

/** Fake link preview to display while data is loading. */
const PlaceholderCard: React.FC = () => (
  <div className={clsx('status-card', {
    'animate-pulse': true,
  })}
  >
    <div className='primary-500 w-2/5 rounded-l'>&nbsp;</div>

    <div className='flex w-3/5 flex-col justify-between break-words p-4 text-primary-50'>
      <p>{generateText(randomIntFromInterval(5, 25))}</p>
      <p>{generateText(randomIntFromInterval(5, 75))}</p>
      <p>{generateText(randomIntFromInterval(5, 15))}</p>
    </div>
  </div>
);

export default React.memo(PlaceholderCard);
