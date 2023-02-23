import clsx from 'clsx';
import React from 'react';

interface IBadge {
  title: React.ReactNode
  slug: string
}
/** Badge to display on a user's profile. */
const Badge: React.FC<IBadge> = ({ title, slug }) => {
  const fallback = !['patron', 'admin', 'moderator', 'opaque', 'badge:donor'].includes(slug);

  return (
    <span
      data-testid='badge'
      className={clsx('inline-flex items-center rounded px-2 py-0.5 text-xs font-medium', {
        'bg-fuchsia-700 text-white': slug === 'patron',
        'bg-emerald-800 text-white': slug === 'badge:donor',
        'bg-black text-white': slug === 'admin',
        'bg-cyan-600 text-white': slug === 'moderator',
        'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100': fallback,
        'bg-white/75 text-gray-900': slug === 'opaque',
      })}
    >
      {title}
    </span>
  );
};

export default Badge;
