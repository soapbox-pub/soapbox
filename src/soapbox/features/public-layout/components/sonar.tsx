import React from 'react';

const Sonar = () => (
  <div className='relative'>
    <div className='relative h-48 w-48'>
      <div className='pointer-events-none absolute left-0 top-0 h-full w-full animate-sonar-scale-4 rounded-full bg-primary-600/25 opacity-0 dark:bg-primary-600/25' />
      <div className='pointer-events-none absolute left-0 top-0 h-full w-full animate-sonar-scale-3 rounded-full bg-primary-600/25 opacity-0 dark:bg-primary-600/25' />
      <div className='pointer-events-none absolute left-0 top-0 h-full w-full animate-sonar-scale-2 rounded-full bg-primary-600/25 opacity-0 dark:bg-primary-600/25' />
      <div className='pointer-events-none absolute left-0 top-0 h-full w-full animate-sonar-scale-1 rounded-full bg-primary-600/25 opacity-0 dark:bg-primary-600/25' />

      <div className='absolute left-0 top-0 h-48 w-48 rounded-full bg-white dark:bg-primary-900' />
    </div>
  </div>
);

export default Sonar;
