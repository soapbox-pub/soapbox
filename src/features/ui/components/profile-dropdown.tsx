import { useFloating } from '@floating-ui/react';
import clsx from 'clsx';
import throttle from 'lodash/throttle';
import React, { useEffect, useMemo, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import { fetchOwnAccounts, logOut, switchAccount } from 'soapbox/actions/auth';
import Account from 'soapbox/components/account';
import { MenuDivider } from 'soapbox/components/ui';
import { useAppDispatch, useAppSelector, useClickOutside, useFeatures } from 'soapbox/hooks';
import { makeGetAccount } from 'soapbox/selectors';

import ThemeToggle from './theme-toggle';

import type { Account as AccountEntity } from 'soapbox/types/entities';

const messages = defineMessages({
  add: { id: 'profile_dropdown.add_account', defaultMessage: 'Add an existing account' },
  theme: { id: 'profile_dropdown.theme', defaultMessage: 'Theme' },
  logout: { id: 'profile_dropdown.logout', defaultMessage: 'Log out @{acct}' },
});

interface IProfileDropdown {
  account: AccountEntity
  children: React.ReactNode
}

type IMenuItem = {
  text: string | React.ReactElement | null
  to?: string
  toggle?: JSX.Element
  icon?: string
  action?: (event: React.MouseEvent) => void
}

const getAccount = makeGetAccount();

const ProfileDropdown: React.FC<IProfileDropdown> = ({ account, children }) => {
  const dispatch = useAppDispatch();
  const features = useFeatures();
  const intl = useIntl();

  const [visible, setVisible] = useState(false);
  const { x, y, strategy, refs } = useFloating<HTMLButtonElement>({ placement: 'bottom-end' });
  const authUsers = useAppSelector((state) => state.auth.users);
  const otherAccounts = useAppSelector((state) => authUsers.map((authUser: any) => getAccount(state, authUser.id)!));

  const handleLogOut = () => {
    dispatch(logOut());
  };

  const handleSwitchAccount = (account: AccountEntity) => {
    return () => {
      dispatch(switchAccount(account.id));
    };
  };

  const fetchOwnAccountThrottled = throttle(() => {
    dispatch(fetchOwnAccounts());
  }, 2000);

  const renderAccount = (account: AccountEntity) => {
    return (
      <Account account={account} showProfileHoverCard={false} withLinkToProfile={false} hideActions />
    );
  };

  const menu: IMenuItem[] = useMemo(() => {
    const menu: IMenuItem[] = [];

    menu.push({ text: renderAccount(account), to: `/@${account.acct}` });

    otherAccounts.forEach((otherAccount: AccountEntity) => {
      if (otherAccount && otherAccount.id !== account.id) {
        menu.push({
          text: renderAccount(otherAccount),
          action: handleSwitchAccount(otherAccount),
        });
      }
    });

    menu.push({ text: null });
    menu.push({ text: intl.formatMessage(messages.theme), toggle: <ThemeToggle /> });
    menu.push({ text: null });

    menu.push({
      text: intl.formatMessage(messages.add),
      to: '/login/add',
      icon: require('@tabler/icons/plus.svg'),
    });

    menu.push({
      text: intl.formatMessage(messages.logout, { acct: account.acct }),
      to: '/logout',
      action: handleLogOut,
      icon: require('@tabler/icons/logout.svg'),
    });

    return menu;
  }, [account, authUsers, features]);

  const toggleVisible = () => setVisible(!visible);

  useEffect(() => {
    fetchOwnAccountThrottled();
  }, [account, authUsers]);

  useClickOutside(refs, () => {
    setVisible(false);
  });

  return (
    <>
      <button
        className='rounded-full focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:ring-gray-800 dark:ring-offset-0 dark:focus:ring-primary-500'
        type='button'
        ref={refs.setReference}
        onClick={toggleVisible}
      >
        {children}
      </button>

      {visible && (
        <div
          ref={refs.setFloating}
          className='z-[1003] mt-2 max-w-xs rounded-md bg-white shadow-lg focus:outline-none dark:bg-gray-900 dark:ring-2 dark:ring-primary-700'
          style={{
            position: strategy,
            top: y ?? 0,
            left: x ?? 0,
            width: 'max-content',
          }}
        >
          {menu.map((menuItem, i) => (
            <MenuItem key={i} menuItem={menuItem} />
          ))}
        </div>
      )}
    </>
  );
};

interface MenuItemProps {
  className?: string
  menuItem: IMenuItem
}

const MenuItem: React.FC<MenuItemProps> = ({ className, menuItem }) => {
  const baseClassName = clsx(className, 'block w-full cursor-pointer truncate px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100 rtl:text-right dark:text-gray-500 dark:hover:bg-gray-800');

  if (menuItem.toggle) {
    return (
      <div className='flex flex-row items-center justify-between space-x-4 px-4 py-1 text-sm text-gray-700 dark:text-gray-400'>
        <span>{menuItem.text}</span>

        {menuItem.toggle}
      </div>
    );
  } else if (!menuItem.text) {
    return <MenuDivider />;
  } else if (menuItem.action) {
    return (
      <button
        type='button'
        onClick={menuItem.action}
        className={baseClassName}
      >
        {menuItem.text}
      </button>
    );
  } else if (menuItem.to) {
    return (
      <Link
        to={menuItem.to}
        className={baseClassName}
      >
        {menuItem.text}
      </Link>
    );
  } else {
    throw menuItem;
  }
};

export default ProfileDropdown;
