import clsx from 'clsx';
import React from 'react';

interface IBackgroundShapes {
  /** Whether the shapes should be absolute positioned or fixed. */
  position?: 'fixed' | 'absolute'
}

/** Gradient that appears in the background of the UI. */
const BackgroundShapes: React.FC<IBackgroundShapes> = ({ position = 'fixed' }) => (
  <div className={clsx(position, 'pointer-events-none inset-x-0 top-0 flex justify-center overflow-hidden')}>
    <div className='bg-gradient-sm lg:bg-gradient-light lg:dark:bg-gradient-dark h-screen w-screen' />
  </div>
);

export default BackgroundShapes;
