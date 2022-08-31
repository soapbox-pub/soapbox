import classNames from 'clsx';
import React from 'react';

interface IBadge {
  title: React.ReactNode,
  slug: 'patron' | 'donor' | 'admin' | 'moderator' | 'bot' | 'opaque',
}

/** Badge to display on a user's profile. */
const Badge: React.FC<IBadge> = ({ title, slug }) => (
  <span
    data-testid='badge'
    className={classNames('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', {
      'bg-fuchsia-700 text-white': slug === 'patron',
      'bg-yellow-500 text-white': slug === 'donor',
      'bg-black text-white': slug === 'admin',
      'bg-cyan-600 text-white': slug === 'moderator',
      'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100': slug === 'bot',
      'bg-white bg-opacity-75 text-gray-900': slug === 'opaque',
    })}
  >
    {title}
  </span>
);

export default Badge;
