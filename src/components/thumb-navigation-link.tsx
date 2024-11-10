import clsx from 'clsx';
import { NavLink, useLocation } from 'react-router-dom';

import IconWithCounter from 'soapbox/components/icon-with-counter.tsx';
import { Icon, Text } from 'soapbox/components/ui/index.ts';

interface IThumbNavigationLink {
  count?: number;
  countMax?: number;
  src: string;
  activeSrc?: string;
  text: string | React.ReactElement;
  to: string;
  exact?: boolean;
  paths?: Array<string>;
}

const ThumbNavigationLink: React.FC<IThumbNavigationLink> = ({ count, countMax, src, activeSrc, text, to, exact, paths }): JSX.Element => {
  const { pathname } = useLocation();

  const isActive = (): boolean => {
    if (paths) {
      return paths.some(path => pathname.startsWith(path));
    } else {
      return exact ? pathname === to : pathname.startsWith(to);
    }
  };

  const active = isActive();

  const icon = (active && activeSrc) || src;

  return (
    <NavLink to={to} exact={exact} className='thumb-navigation__link'>
      {count !== undefined ? (
        <IconWithCounter
          src={icon}
          className={clsx({
            'h-5 w-5': true,
            'text-gray-600 black:text-white': !active,
            'text-primary-500': active,
          })}
          count={count}
          countMax={countMax}
        />
      ) : (
        <Icon
          src={icon}
          className={clsx({
            'h-5 w-5': true,
            'text-gray-600 black:text-white': !active,
            'text-primary-500': active,
          })}
        />
      )}

      <Text
        tag='span'
        size='xs'
        weight='medium'
        className={clsx({
          'text-gray-600': !active,
          'text-primary-500': active,
        })}
      >
        {text}
      </Text>
    </NavLink>
  );
};

export default ThumbNavigationLink;
