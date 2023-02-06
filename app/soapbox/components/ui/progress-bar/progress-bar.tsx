import React from 'react';

interface IProgressBar {
  progress: number,
}

/** A horizontal meter filled to the given percentage. */
const ProgressBar: React.FC<IProgressBar> = ({ progress }) => (
  <div className='dark:bg-primary-800 h-2.5 w-full overflow-hidden rounded-full bg-gray-300'>
    <div className='bg-secondary-500 h-full' style={{ width: `${Math.floor(progress * 100)}%` }} />
  </div>
);

export default ProgressBar;
