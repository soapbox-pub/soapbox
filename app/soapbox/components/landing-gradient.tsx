import React from 'react';

/** Fullscreen gradient used as a backdrop to public pages. */
const LandingGradient: React.FC = () => (
  <div className='from-primary-50 to-gradient-end/10 dark:from-primary-900/50 dark:via-primary-900 dark:to-primary-800/50 fixed h-screen w-full bg-gradient-to-tr via-white' />
);

export default LandingGradient;
