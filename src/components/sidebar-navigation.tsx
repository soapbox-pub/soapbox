import bellFilledIcon from '@tabler/icons/filled/bell.svg';
import circlesFilledIcon from '@tabler/icons/filled/circles.svg';
import homeFilledIcon from '@tabler/icons/filled/home.svg';
import settingsFilledIcon from '@tabler/icons/filled/settings.svg';
import userFilledIcon from '@tabler/icons/filled/user.svg';
import atIcon from '@tabler/icons/outline/at.svg';
import bellIcon from '@tabler/icons/outline/bell.svg';
import bookmarkIcon from '@tabler/icons/outline/bookmark.svg';
import calendarEventIcon from '@tabler/icons/outline/calendar-event.svg';
import circlesIcon from '@tabler/icons/outline/circles.svg';
import codeIcon from '@tabler/icons/outline/code.svg';
import dashboardIcon from '@tabler/icons/outline/dashboard.svg';
import dotsCircleHorizontalIcon from '@tabler/icons/outline/dots-circle-horizontal.svg';
import homeIcon from '@tabler/icons/outline/home.svg';
import listIcon from '@tabler/icons/outline/list.svg';
import mailIcon from '@tabler/icons/outline/mail.svg';
import messagesIcon from '@tabler/icons/outline/messages.svg';
import searchIcon from '@tabler/icons/outline/search.svg';
import settingsIcon from '@tabler/icons/outline/settings.svg';
import userPlusIcon from '@tabler/icons/outline/user-plus.svg';
import userIcon from '@tabler/icons/outline/user.svg';
import walletIcon from '@tabler/icons/outline/wallet.svg';
import worldIcon from '@tabler/icons/outline/world.svg';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import Account from 'soapbox/components/account.tsx';
import SiteLogo from 'soapbox/components/site-logo.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import { useStatContext } from 'soapbox/contexts/stat-context.tsx';
import Search from 'soapbox/features/compose/components/search.tsx';
import ComposeButton from 'soapbox/features/ui/components/compose-button.tsx';
import ProfileDropdown from 'soapbox/features/ui/components/profile-dropdown.tsx';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';
import { useFeatures } from 'soapbox/hooks/useFeatures.ts';
import { useInstance } from 'soapbox/hooks/useInstance.ts';
import { useOwnAccount } from 'soapbox/hooks/useOwnAccount.ts';
import { useSettings } from 'soapbox/hooks/useSettings.ts';
import { useSettingsNotifications } from 'soapbox/hooks/useSettingsNotifications.ts';

import DropdownMenu, { Menu } from './dropdown-menu/index.ts';
import SidebarNavigationLink from './sidebar-navigation-link.tsx';

const messages = defineMessages({
  follow_requests: { id: 'navigation_bar.follow_requests', defaultMessage: 'Follow requests' },
  bookmarks: { id: 'column.bookmarks', defaultMessage: 'Bookmarks' },
  lists: { id: 'column.lists', defaultMessage: 'Lists' },
  events: { id: 'column.events', defaultMessage: 'Events' },
  developers: { id: 'navigation.developers', defaultMessage: 'Developers' },
});

/** Desktop sidebar with links to different views in the app. */
const SidebarNavigation = () => {
  const intl = useIntl();
  const { unreadChatsCount } = useStatContext();

  const { instance } = useInstance();
  const features = useFeatures();
  const { isDeveloper } = useSettings();
  const { account } = useOwnAccount();

  const notificationCount = useAppSelector((state) => state.notifications.unread);
  const followRequestsCount = useAppSelector((state) => state.user_lists.follow_requests.items.count());
  const dashboardCount = useAppSelector((state) => state.admin.openReports.count() + state.admin.awaitingApproval.count());
  const settingsNotifications = useSettingsNotifications();

  const restrictUnauth = instance.pleroma.metadata.restrict_unauthenticated;

  const makeMenu = (): Menu => {
    const menu: Menu = [];

    if (account) {
      if (account.locked || followRequestsCount > 0) {
        menu.push({
          to: '/follow_requests',
          text: intl.formatMessage(messages.follow_requests),
          icon: userPlusIcon,
          count: followRequestsCount,
        });
      }

      if (features.bookmarks) {
        menu.push({
          to: '/bookmarks',
          text: intl.formatMessage(messages.bookmarks),
          icon: bookmarkIcon,
        });
      }

      if (features.lists) {
        menu.push({
          to: '/lists',
          text: intl.formatMessage(messages.lists),
          icon: listIcon,
        });
      }

      if (features.events) {
        menu.push({
          to: '/events',
          text: intl.formatMessage(messages.events),
          icon: calendarEventIcon,
        });
      }

      if (isDeveloper) {
        menu.push({
          to: '/developers',
          icon: codeIcon,
          text: intl.formatMessage(messages.developers),
        });
      }
    }

    return menu;
  };

  const menu = makeMenu();

  /** Conditionally render the supported messages link */
  const renderMessagesLink = (): React.ReactNode => {
    if (features.chats) {
      return (
        <SidebarNavigationLink
          to='/chats'
          icon={messagesIcon}
          count={unreadChatsCount}
          countMax={9}
          text={<FormattedMessage id='navigation.chats' defaultMessage='Chats' />}
        />
      );
    }

    if (features.directTimeline || features.conversations) {
      return (
        <SidebarNavigationLink
          to='/messages'
          icon={mailIcon}
          text={<FormattedMessage id='navigation.direct_messages' defaultMessage='Messages' />}
        />
      );
    }

    return null;
  };

  return (
    <Stack justifyContent='between' className='min-h-screen py-6'>
      <Stack space={6}>
        <Link key='logo' to='/' data-preview-title-id='column.home' className='ml-4 flex shrink-0 items-center'>
          <SiteLogo alt='Logo' className='h-10 w-auto cursor-pointer' />
          <span className='hidden'><FormattedMessage id='tabs_bar.home' defaultMessage='Home' /></span>
        </Link>

        <Search openInRoute autosuggest />

        <Stack space={2}>
          <SidebarNavigationLink
            to='/'
            icon={homeIcon}
            activeIcon={homeFilledIcon}
            text={<FormattedMessage id='tabs_bar.home' defaultMessage='Home' />}
          />

          <SidebarNavigationLink
            to='/search'
            icon={searchIcon}
            text={<FormattedMessage id='tabs_bar.search' defaultMessage='Discover' />}
          />

          {account && (
            <>
              <SidebarNavigationLink
                to='/notifications'
                icon={bellIcon}
                activeIcon={bellFilledIcon}
                count={notificationCount}
                text={<FormattedMessage id='tabs_bar.notifications' defaultMessage='Notifications' />}
              />

              {renderMessagesLink()}

              {features.groups && (
                <SidebarNavigationLink
                  to='/groups'
                  icon={circlesIcon}
                  activeIcon={circlesFilledIcon}
                  text={<FormattedMessage id='tabs_bar.groups' defaultMessage='Groups' />}
                />
              )}

              <SidebarNavigationLink
                to={`/@${account.acct}`}
                icon={userIcon}
                activeIcon={userFilledIcon}
                text={<FormattedMessage id='tabs_bar.profile' defaultMessage='Profile' />}
              />

              <SidebarNavigationLink
                to={'/my-wallet'}
                icon={walletIcon}
                activeIcon={walletIcon}
                text={<FormattedMessage id='tabs_bar.wallet' defaultMessage='My Wallet' />}
              />

              <SidebarNavigationLink
                to='/settings'
                icon={settingsIcon}
                activeIcon={settingsFilledIcon}
                text={<FormattedMessage id='tabs_bar.settings' defaultMessage='Settings' />}
                count={settingsNotifications.size}
              />

              {account.staff && (
                <SidebarNavigationLink
                  to='/soapbox/admin'
                  icon={dashboardIcon}
                  count={dashboardCount}
                  text={<FormattedMessage id='tabs_bar.dashboard' defaultMessage='Dashboard' />}
                />
              )}
            </>
          )}

          {(features.publicTimeline) && (
            <>
              {(account || !restrictUnauth.timelines.local) && (
                <SidebarNavigationLink
                  to='/timeline/local'
                  icon={features.federating ? atIcon : worldIcon}
                  text={features.federating ? instance.domain : <FormattedMessage id='tabs_bar.global' defaultMessage='Global' />}
                />
              )}

              {(features.federating && (account || !restrictUnauth.timelines.federated)) && (
                <SidebarNavigationLink
                  to='/timeline/global'
                  icon={worldIcon}
                  text={<FormattedMessage id='tabs_bar.global' defaultMessage='Global' />}
                />
              )}
            </>
          )}

          {menu.length > 0 && (
            <DropdownMenu items={menu} placement='top'>
              <SidebarNavigationLink
                icon={dotsCircleHorizontalIcon}
                text={<FormattedMessage id='tabs_bar.more' defaultMessage='More' />}
              />
            </DropdownMenu>
          )}
        </Stack>

        {account && (
          <ComposeButton />
        )}
      </Stack>

      {account && (
        <div className='mt-12'>
          <ProfileDropdown account={account} placement='top'>
            <div className='w-full p-2'>
              <Account account={account} showProfileHoverCard={false} withLinkToProfile={false} hideActions />
            </div>
          </ProfileDropdown>
        </div>
      )}
    </Stack>
  );
};

export default SidebarNavigation;
