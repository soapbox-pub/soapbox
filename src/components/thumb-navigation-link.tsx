import clsx from 'clsx';
import { NavLink, useLocation } from 'react-router-dom';

import IconWithCounter from 'soapbox/components/icon-with-counter.tsx';
import Icon from 'soapbox/components/ui/icon.tsx';
import Text from 'soapbox/components/ui/text.tsx';

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
    <NavLink to={to} exact={exact} className='flex flex-1 flex-col items-center space-y-1 px-2 py-2.5 text-lg text-gray-600'>
      {count !== undefined ? (
        <IconWithCounter
          src={icon}
          className={clsx({
            'size-5': true,
            'text-black dark:text-white black:text-white': active,
            'text-gray-600': !active,
          })}
          count={count}
          countMax={countMax}
        />
      ) : (
        <Icon
          src={icon}
          className={clsx({
            'size-5': true,
            'text-black black:text-white dark:text-white': active,
            'text-gray-600 black:text-gray-500 dark:text-gray-500': !active,
          })}
        />
      )}

      <Text
        tag='span'
        size='xs'
        weight='medium'
        className={clsx({
          'text-gray-600 black:text-white dark:text-white': active,
          '!text-gray-600 black:!text-gray-500 dark:!text-gray-500': !active,
        })}
      >
        {text}
      </Text>
    </NavLink>
  );
};

export default ThumbNavigationLink;
