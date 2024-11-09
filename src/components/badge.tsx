import clsx from 'clsx';
import { useMemo } from 'react';

import { hexToHsl } from 'soapbox/utils/theme';

interface IBadge {
  title: React.ReactNode;
  slug: string;
  color?: string;
}
/** Badge to display on a user's profile. */
const Badge: React.FC<IBadge> = ({ title, slug, color }) => {
  const fallback = !['patron', 'admin', 'moderator', 'opaque', 'badge:donor'].includes(slug);

  const isDark = useMemo(() => {
    if (!color) return false;

    const hsl = hexToHsl(color);

    if (hsl && hsl.l > 50) return false;

    return true;
  }, [color]);

  return (
    <span
      data-testid='badge'
      className={clsx('inline-flex items-center rounded px-2 py-0.5 text-xs font-medium', color ? {
        'bg-gray-100 text-gray-100': isDark,
        'bg-gray-800 text-gray-900': !isDark,
      } : {
        'bg-fuchsia-700 text-white': slug === 'patron',
        'bg-emerald-800 text-white': slug === 'badge:donor',
        'bg-black text-white': slug === 'admin',
        'bg-cyan-600 text-white': slug === 'moderator',
        'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100': fallback,
        'bg-white/75 text-gray-900': slug === 'opaque',
      })}
      style={color ? { background: color } : undefined}
    >
      {title}
    </span>
  );
};

export default Badge;
