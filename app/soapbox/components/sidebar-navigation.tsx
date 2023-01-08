import { List as ImmutableList } from 'immutable';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { getSettings } from 'soapbox/actions/settings';
import { getSoapboxConfig } from 'soapbox/actions/soapbox';
import { Stack } from 'soapbox/components/ui';
import DropdownMenu from 'soapbox/containers/dropdown-menu-container';
import { useStatContext } from 'soapbox/contexts/stat-context';
import ComposeButton from 'soapbox/features/ui/components/compose-button';
import { useAppSelector, useFeatures, useOwnAccount, useSettings } from 'soapbox/hooks';

import SidebarNavigationLink from './sidebar-navigation-link';

import type { Menu } from 'soapbox/components/dropdown-menu';
import type { FooterItem } from 'soapbox/types/soapbox';

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

  const features = useFeatures();
  const settings = useSettings();
  const account = useOwnAccount();
  const notificationCount = useAppSelector((state) => state.notifications.unread);
  const followRequestsCount = useAppSelector((state) => state.user_lists.follow_requests.items.count());
  const dashboardCount = useAppSelector((state) => state.admin.openReports.count() + state.admin.awaitingApproval.count());

  const { navlinks, locale } = useAppSelector((state) => {
    const soapboxConfig = getSoapboxConfig(state);

    return {
      navlinks: (soapboxConfig.navlinks.get('homeFooter') || ImmutableList()) as ImmutableList<FooterItem>,
      locale: getSettings(state).get('locale') as string,
    };
  });

  const makeMenu = (): Menu => {
    const menu: Menu = [];

    if (account) {
      if (account.locked || followRequestsCount > 0) {
        menu.push({
          to: '/follow_requests',
          text: intl.formatMessage(messages.follow_requests),
          icon: require('@tabler/icons/user-plus.svg'),
          count: followRequestsCount,
        });
      }

      if (features.bookmarks) {
        menu.push({
          to: '/bookmarks',
          text: intl.formatMessage(messages.bookmarks),
          icon: require('@tabler/icons/bookmark.svg'),
        });
      }

      if (features.lists) {
        menu.push({
          to: '/lists',
          text: intl.formatMessage(messages.lists),
          icon: require('@tabler/icons/list.svg'),
        });
      }

      if (features.events) {
        menu.push({
          to: '/events',
          text: intl.formatMessage(messages.events),
          icon: require('@tabler/icons/calendar-event.svg'),
        });
      }

      if (settings.get('isDeveloper')) {
        menu.push({
          to: '/developers',
          icon: require('@tabler/icons/code.svg'),
          text: intl.formatMessage(messages.developers),
        });
      }
    }

    if (navlinks.count() > 0) {
      menu.push(null); // divider
      navlinks.forEach(function(linkItem) {
        const url = linkItem.get('url');
        const isExternal = url.startsWith('http');
        menu.push({
          to: url,
          text: (linkItem.getIn(['titleLocales', locale]) || linkItem.get('title')) as string,
          newTab: isExternal,
        });
      });
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
          icon={require('@tabler/icons/messages.svg')}
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
          icon={require('@tabler/icons/mail.svg')}
          text={<FormattedMessage id='navigation.direct_messages' defaultMessage='Messages' />}
        />
      );
    }

    return null;
  };

  return (
    <Stack space={4}>
      <Stack space={2}>
        <SidebarNavigationLink
          to='/'
          icon={require('@tabler/icons/home.svg')}
          text={<FormattedMessage id='tabs_bar.home' defaultMessage='Home' />}
        />

        {features.publicTimeline && (
          <>
            <SidebarNavigationLink
              to='/timeline/local'
              icon={features.federating ? require('@tabler/icons/affiliate.svg') : require('@tabler/icons/world.svg')}
              text={features.federating ? <FormattedMessage id='tabs_bar.local' defaultMessage='Local' /> : <FormattedMessage id='tabs_bar.all' defaultMessage='All' />}
            />

            {features.federating && (
              <SidebarNavigationLink
                to='/timeline/fediverse'
                icon={require('@tabler/icons/topology-star-ring-3.svg')}
                text={<FormattedMessage id='tabs_bar.fediverse' defaultMessage='Fediverse' />}
              />
            )}
          </>
        )}

        <SidebarNavigationLink
          to='/search'
          icon={require('@tabler/icons/search.svg')}
          text={<FormattedMessage id='tabs_bar.search' defaultMessage='Search' />}
        />

        {account && (
          <>
            <SidebarNavigationLink
              to='/notifications'
              icon={require('@tabler/icons/bell.svg')}
              count={notificationCount}
              text={<FormattedMessage id='tabs_bar.notifications' defaultMessage='Notifications' />}
            />

            {renderMessagesLink()}

            <SidebarNavigationLink
              to={`/@${account.acct}`}
              icon={require('@tabler/icons/user.svg')}
              text={<FormattedMessage id='tabs_bar.profile' defaultMessage='Profile' />}
            />

            <SidebarNavigationLink
              to='/settings'
              icon={require('@tabler/icons/settings.svg')}
              text={<FormattedMessage id='tabs_bar.settings' defaultMessage='Settings' />}
            />

            {account.staff && (
              <SidebarNavigationLink
                to='/soapbox/admin'
                icon={require('@tabler/icons/dashboard.svg')}
                count={dashboardCount}
                text={<FormattedMessage id='tabs_bar.dashboard' defaultMessage='Dashboard' />}
              />
            )}
          </>
        )}



        {menu.length > 0 && (
          <DropdownMenu items={menu}>
            <SidebarNavigationLink
              icon={require('@tabler/icons/dots-circle-horizontal.svg')}
              text={<FormattedMessage id='tabs_bar.more' defaultMessage='More' />}
            />
          </DropdownMenu>
        )}
      </Stack>

      {account && (
        <ComposeButton />
      )}
    </Stack>
  );
};

export default SidebarNavigation;
