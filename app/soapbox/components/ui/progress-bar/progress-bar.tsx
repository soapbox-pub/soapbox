import clsx from 'clsx';
import React from 'react';
import { spring } from 'react-motion';

import Motion from 'soapbox/features/ui/util/optional-motion';

interface IProgressBar {
  /** Number between 0 and 1 to represent the percentage complete. */
  progress: number
  /** Height of the progress bar. */
  size?: 'sm' | 'md'
}

/** A horizontal meter filled to the given percentage. */
const ProgressBar: React.FC<IProgressBar> = ({ progress, size = 'md' }) => (
  <div
    className={clsx('h-2.5 w-full overflow-hidden rounded-lg bg-gray-300 dark:bg-primary-800', {
      'h-2.5': size === 'md',
      'h-[6px]': size === 'sm',
    })}
  >
    <Motion defaultStyle={{ width: 0 }} style={{ width: spring(progress * 100) }}>
      {({ width }) => (
        <div
          className='h-full bg-secondary-500'
          style={{ width: `${width}%` }}
        />
      )}
    </Motion>
  </div>
);

export default ProgressBar;
