import clsx from 'clsx';
import { forwardRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

import Icon from 'soapbox/components/ui/icon.tsx';
import Text from 'soapbox/components/ui/text.tsx';

interface ISidebarNavigationLink {
  /** Notification count, if any. */
  count?: number;
  /** Optional max to cap count (ie: N+) */
  countMax?: number;
  /** URL to an SVG icon. */
  icon: string;
  /** URL to an SVG icon for active state. */
  activeIcon?: string;
  /** Link label. */
  text: React.ReactNode;
  /** Route to an internal page. */
  to?: string;
  /** Callback when the link is clicked. */
  onClick?: React.EventHandler<React.MouseEvent>;
}

/** Desktop sidebar navigation link. */
const SidebarNavigationLink = forwardRef((props: ISidebarNavigationLink, ref: React.ForwardedRef<HTMLAnchorElement>): JSX.Element => {
  const { icon, activeIcon, text, to = '', count, countMax, onClick } = props;
  const { pathname } = useLocation();

  const isActive = pathname === to;

  const handleClick: React.EventHandler<React.MouseEvent> = (e) => {
    if (onClick) {
      onClick(e);
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <NavLink
      exact
      to={to}
      ref={ref}
      onClick={handleClick}
      className={clsx({
        'flex items-center px-4 py-3.5 text-base font-semibold space-x-4 rtl:space-x-reverse rounded-full group hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-primary-800': true,
        'text-gray-600 dark:text-gray-500': !isActive,
        'text-gray-900 dark:text-gray-50': isActive,
      })}
    >
      <span className='relative'>
        <Icon
          src={(isActive && activeIcon) || icon}
          count={count}
          countMax={countMax}
          className={clsx('size-5', {
            'text-gray-600 black:text-white dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-gray-50': !isActive,
            'text-gray-900 dark:text-gray-50': isActive,
          })}
        />
      </span>

      <Text weight='semibold' theme='inherit' truncate>{text}</Text>
    </NavLink>
  );
});

export default SidebarNavigationLink;
