import clsx from 'clsx';
import React from 'react';

interface IBanner {
  theme: 'frosted' | 'opaque'
  children: React.ReactNode
  className?: string
}

/** Displays a sticky full-width banner at the bottom of the screen. */
const Banner: React.FC<IBanner> = ({ theme, children, className }) => {
  return (
    <div
      data-testid='banner'
      className={clsx('fixed inset-x-0 bottom-0 z-50 py-8', {
        'backdrop-blur bg-primary-800/80 dark:bg-primary-900/80': theme === 'frosted',
        'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-3xl dark:shadow-inset': theme === 'opaque',
      }, className)}
    >
      <div className='mx-auto max-w-4xl px-4'>
        {children}
      </div>
    </div>
  );
};

export default Banner;
