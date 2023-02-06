import React from 'react';

const Sonar = () => (
  <div className='relative'>
    <div className='relative h-48 w-48'>
      <div className='animate-sonar-scale-4 bg-primary-600/25 dark:bg-primary-600/25 pointer-events-none absolute top-0 left-0 h-full w-full rounded-full opacity-0' />
      <div className='animate-sonar-scale-3 bg-primary-600/25 dark:bg-primary-600/25 pointer-events-none absolute top-0 left-0 h-full w-full rounded-full opacity-0' />
      <div className='animate-sonar-scale-2 bg-primary-600/25 dark:bg-primary-600/25 pointer-events-none absolute top-0 left-0 h-full w-full rounded-full opacity-0' />
      <div className='animate-sonar-scale-1 bg-primary-600/25 dark:bg-primary-600/25 pointer-events-none absolute top-0 left-0 h-full w-full rounded-full opacity-0' />

      <div className='dark:bg-primary-900 absolute top-0 left-0 h-48 w-48 rounded-full bg-white' />
    </div>
  </div>
);

export default Sonar;
