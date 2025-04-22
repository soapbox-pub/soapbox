import banIcon from '@tabler/icons/outline/ban.svg';
import bookmarkIcon from '@tabler/icons/outline/bookmark.svg';
import calendarEventIcon from '@tabler/icons/outline/calendar-event.svg';
import chevronDownIcon from '@tabler/icons/outline/chevron-down.svg';
import circleXIcon from '@tabler/icons/outline/circle-x.svg';
import circlesIcon from '@tabler/icons/outline/circles.svg';
import codeIcon from '@tabler/icons/outline/code.svg';
import filterIcon from '@tabler/icons/outline/filter.svg';
import hashIcon from '@tabler/icons/outline/hash.svg';
import listIcon from '@tabler/icons/outline/list.svg';
import logoutIcon from '@tabler/icons/outline/logout.svg';
import plusIcon from '@tabler/icons/outline/plus.svg';
import settingsIcon from '@tabler/icons/outline/settings.svg';
import userPlusIcon from '@tabler/icons/outline/user-plus.svg';
import userIcon from '@tabler/icons/outline/user.svg';
import walletIcon from '@tabler/icons/outline/wallet.svg';
import xIcon from '@tabler/icons/outline/x.svg';
import clsx from 'clsx';
import { useCallback, useEffect, useRef, useState } from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';
import { Link, NavLink } from 'react-router-dom';

import { fetchOwnAccounts, logOut, switchAccount } from 'soapbox/actions/auth.ts';
import { getSettings } from 'soapbox/actions/settings.ts';
import { closeSidebar } from 'soapbox/actions/sidebar.ts';
import { useAccount } from 'soapbox/api/hooks/index.ts';
import Account from 'soapbox/components/account.tsx';
import Divider from 'soapbox/components/ui/divider.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import IconButton from 'soapbox/components/ui/icon-button.tsx';
import Icon from 'soapbox/components/ui/icon.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import ProfileStats from 'soapbox/features/ui/components/profile-stats.tsx';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';
import { useFeatures } from 'soapbox/hooks/useFeatures.ts';
import { useSettingsNotifications } from 'soapbox/hooks/useSettingsNotifications.ts';
import { makeGetOtherAccounts } from 'soapbox/selectors/index.ts';

import type { Account as AccountEntity } from 'soapbox/schemas/account.ts';

const messages = defineMessages({
  followers: { id: 'account.followers', defaultMessage: 'Followers' },
  follows: { id: 'account.follows', defaultMessage: 'Following' },
  profile: { id: 'account.profile', defaultMessage: 'Profile' },
  preferences: { id: 'navigation_bar.preferences', defaultMessage: 'Preferences' },
  blocks: { id: 'navigation_bar.blocks', defaultMessage: 'Blocks' },
  domainBlocks: { id: 'navigation_bar.domain_blocks', defaultMessage: 'Domain blocks' },
  mutes: { id: 'navigation_bar.mutes', defaultMessage: 'Mutes' },
  filters: { id: 'navigation_bar.filters', defaultMessage: 'Filters' },
  followedTags: { id: 'navigation_bar.followed_tags', defaultMessage: 'Followed hashtags' },
  soapboxConfig: { id: 'navigation_bar.soapbox_config', defaultMessage: 'Soapbox config' },
  accountMigration: { id: 'navigation_bar.account_migration', defaultMessage: 'Move account' },
  accountAliases: { id: 'navigation_bar.account_aliases', defaultMessage: 'Account aliases' },
  logout: { id: 'navigation_bar.logout', defaultMessage: 'Logout' },
  bookmarks: { id: 'column.bookmarks', defaultMessage: 'Bookmarks' },
  lists: { id: 'column.lists', defaultMessage: 'Lists' },
  groups: { id: 'column.groups', defaultMessage: 'Groups' },
  events: { id: 'column.events', defaultMessage: 'Events' },
  invites: { id: 'navigation_bar.invites', defaultMessage: 'Invites' },
  developers: { id: 'navigation.developers', defaultMessage: 'Developers' },
  addAccount: { id: 'profile_dropdown.add_account', defaultMessage: 'Add an existing account' },
  followRequests: { id: 'navigation_bar.follow_requests', defaultMessage: 'Follow requests' },
  close: { id: 'lightbox.close', defaultMessage: 'Close' },
});

interface ISidebarLink {
  href?: string;
  to?: string;
  icon: string;
  text: string | JSX.Element;
  onClick: React.EventHandler<React.MouseEvent>;
  count?: number;
}

const SidebarLink: React.FC<ISidebarLink> = ({ href, to, icon, text, onClick, count }) => {
  const body = (
    <HStack space={2} alignItems='center'>
      <div className='relative inline-flex rounded-full bg-primary-50 p-2 dark:bg-gray-800'>
        <Icon src={icon} className='size-5 text-primary-500' count={count} />
      </div>

      <Text tag='span' weight='medium' theme='inherit'>{text}</Text>
    </HStack>
  );

  if (to) {
    return (
      <NavLink className='group rounded-full text-gray-900 hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-800' to={to} onClick={onClick}>
        {body}
      </NavLink>
    );
  }

  return (
    <a className='group rounded-full text-gray-900 hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-800' href={href} target='_blank' onClick={onClick}>
      {body}
    </a>
  );
};

const SidebarMenu: React.FC = (): JSX.Element | null => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const getOtherAccounts = useCallback(makeGetOtherAccounts(), []);
  const features = useFeatures();
  const me = useAppSelector((state) => state.me);
  const { account } = useAccount(me || undefined);
  const otherAccounts = useAppSelector((state) => getOtherAccounts(state));
  const sidebarOpen = useAppSelector((state) => state.sidebar.sidebarOpen);
  const settings = useAppSelector((state) => getSettings(state));
  const followRequestsCount = useAppSelector((state) => state.user_lists.follow_requests.items.count());
  const settingsNotifications = useSettingsNotifications();

  const closeButtonRef = useRef(null);

  const [switcher, setSwitcher] = useState(false);

  const onClose = () => dispatch(closeSidebar());

  const handleClose = () => {
    setSwitcher(false);
    onClose();
  };

  const handleSwitchAccount = (account: AccountEntity): React.MouseEventHandler => {
    return (e) => {
      e.preventDefault();
      dispatch(switchAccount(account.id));
    };
  };

  const onClickLogOut: React.MouseEventHandler = (e) => {
    e.preventDefault();
    dispatch(logOut());
  };

  const handleSwitcherClick: React.MouseEventHandler = (e) => {
    e.preventDefault();

    setSwitcher((prevState) => (!prevState));
  };

  const renderAccount = (account: AccountEntity) => (
    <Link to={'/'} className='inline-flex'>
      <button className='!block space-x-2 !border-none !p-0 !py-2 !text-primary-600 hover:!underline  focus:!ring-transparent focus:!ring-offset-0 dark:!text-accent-blue rtl:space-x-reverse' onClick={handleSwitchAccount(account)} key={account.id}>
        <div className='pointer-events-none max-w-[288px]'>
          <Account account={account} showProfileHoverCard={false} withRelationship={false} withLinkToProfile={false} />
        </div>
      </button>
    </Link>
  );

  useEffect(() => {
    dispatch(fetchOwnAccounts());
  }, []);

  if (!account) return null;

  return (
    <div
      aria-expanded={sidebarOpen}
      className={
        clsx({
          'z-[1000]': sidebarOpen,
          hidden: !sidebarOpen,
        })
      }
    >
      <button
        className='fixed inset-0 bg-gray-500/90 black:bg-gray-900/90 dark:bg-gray-700/90'
        onClick={handleClose}
      />

      <div className='fixed inset-0 z-[1000] flex'>
        <div
          className={
            clsx({
              'flex flex-col flex-1 bg-white black:bg-black dark:bg-primary-900 -translate-x-full rtl:translate-x-full w-full max-w-xs': true,
              '!translate-x-0': sidebarOpen,
            })
          }
        >
          <IconButton
            title={intl.formatMessage(messages.close)}
            onClick={handleClose}
            src={xIcon}
            ref={closeButtonRef}
            iconClassName='h-6 w-6'
            className='absolute right-0 top-0 -mr-11 mt-2 text-gray-600 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300'
          />

          <div className='relative size-full overflow-auto overflow-y-scroll'>
            <div className='p-4'>
              <Stack space={4}>
                <Link to={`/@${account.acct}`} onClick={onClose}>
                  <Account account={account} showProfileHoverCard={false} withLinkToProfile={false} />
                </Link>

                <ProfileStats
                  account={account}
                  onClickHandler={handleClose}
                />

                <Stack space={4}>
                  <Divider />

                  <SidebarLink
                    to={`/@${account.acct}`}
                    icon={userIcon}
                    text={intl.formatMessage(messages.profile)}
                    onClick={onClose}
                  />

                  <SidebarLink
                    to={'/wallet'}
                    icon={walletIcon}
                    text={<FormattedMessage id='tabs_bar.wallet' defaultMessage='Wallet' />}
                    onClick={onClose}
                  />

                  {(account.locked || followRequestsCount > 0) && (
                    <SidebarLink
                      to='/follow_requests'
                      icon={userPlusIcon}
                      text={intl.formatMessage(messages.followRequests)}
                      onClick={onClose}
                    />
                  )}

                  {features.bookmarks && (
                    <SidebarLink
                      to='/bookmarks'
                      icon={bookmarkIcon}
                      text={intl.formatMessage(messages.bookmarks)}
                      onClick={onClose}
                    />
                  )}

                  {features.groups && (
                    <SidebarLink
                      to='/groups'
                      icon={circlesIcon}
                      text={intl.formatMessage(messages.groups)}
                      onClick={onClose}
                    />
                  )}

                  {features.lists && (
                    <SidebarLink
                      to='/lists'
                      icon={listIcon}
                      text={intl.formatMessage(messages.lists)}
                      onClick={onClose}
                    />
                  )}

                  {features.events && (
                    <SidebarLink
                      to='/events'
                      icon={calendarEventIcon}
                      text={intl.formatMessage(messages.events)}
                      onClick={onClose}
                    />
                  )}

                  {settings.get('isDeveloper') && (
                    <SidebarLink
                      to='/developers'
                      icon={codeIcon}
                      text={intl.formatMessage(messages.developers)}
                      onClick={onClose}
                    />
                  )}

                  <Divider />

                  {features.blocks && (
                    <SidebarLink
                      to='/blocks'
                      icon={banIcon}
                      text={intl.formatMessage(messages.blocks)}
                      onClick={onClose}
                    />
                  )}

                  <SidebarLink
                    to='/mutes'
                    icon={circleXIcon}
                    text={intl.formatMessage(messages.mutes)}
                    onClick={onClose}
                  />

                  <SidebarLink
                    to='/settings/preferences'
                    icon={settingsIcon}
                    text={intl.formatMessage(messages.preferences)}
                    onClick={onClose}
                    count={settingsNotifications.size}
                  />

                  {features.federating && (
                    <SidebarLink
                      to='/domain_blocks'
                      icon={banIcon}
                      text={intl.formatMessage(messages.domainBlocks)}
                      onClick={onClose}
                    />
                  )}

                  {(features.filters || features.filtersV2) && (
                    <SidebarLink
                      to='/filters'
                      icon={filterIcon}
                      text={intl.formatMessage(messages.filters)}
                      onClick={onClose}
                    />
                  )}

                  {features.followedHashtagsList && (
                    <SidebarLink
                      to='/followed_tags'
                      icon={hashIcon}
                      text={intl.formatMessage(messages.followedTags)}
                      onClick={onClose}
                    />
                  )}

                  {account.admin && (
                    <SidebarLink
                      to='/soapbox/config'
                      icon={settingsIcon}
                      text={intl.formatMessage(messages.soapboxConfig)}
                      onClick={onClose}
                    />
                  )}

                  <Divider />

                  <SidebarLink
                    to='/logout'
                    icon={logoutIcon}
                    text={intl.formatMessage(messages.logout)}
                    onClick={onClickLogOut}
                  />

                  <Divider />

                  <Stack space={4}>
                    <button type='button' onClick={handleSwitcherClick} className='py-1'>
                      <HStack alignItems='center' justifyContent='between'>
                        <Text tag='span'>
                          <FormattedMessage id='profile_dropdown.switch_account' defaultMessage='Switch accounts' />
                        </Text>

                        <Icon
                          src={chevronDownIcon}
                          className={clsx('size-4 text-gray-900 transition-transform dark:text-gray-100', {
                            'rotate-180': switcher,
                          })}
                        />
                      </HStack>
                    </button>

                    {switcher && (
                      <div className='border-t border-solid border-gray-100 dark:border-gray-800'>
                        {otherAccounts.map(account => renderAccount(account))}

                        <NavLink className='flex items-center space-x-1 py-2' to='/login/add' onClick={handleClose}>
                          <Icon className='size-4 text-primary-500' src={plusIcon} />
                          <Text size='sm' weight='medium'>{intl.formatMessage(messages.addAccount)}</Text>
                        </NavLink>
                      </div>
                    )}
                  </Stack>
                </Stack>
              </Stack>
            </div>
          </div>
        </div>

        {/* Dummy element to keep Close Icon visible */}
        <div
          aria-hidden
          className='w-14 shrink-0'
          onClick={handleClose}
        />
      </div>
    </div>
  );
};

export default SidebarMenu;
