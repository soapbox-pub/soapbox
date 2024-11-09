import bellFilledIcon from '@tabler/icons/filled/bell.svg';
import circlesFilledIcon from '@tabler/icons/filled/circles.svg';
import homeFilledIcon from '@tabler/icons/filled/home.svg';
import mailFilledIcon from '@tabler/icons/filled/mail.svg';
import bellIcon from '@tabler/icons/outline/bell.svg';
import circlesIcon from '@tabler/icons/outline/circles.svg';
import dashboardIcon from '@tabler/icons/outline/dashboard.svg';
import homeIcon from '@tabler/icons/outline/home.svg';
import mailIcon from '@tabler/icons/outline/mail.svg';
import messagesIcon from '@tabler/icons/outline/messages.svg';
import searchIcon from '@tabler/icons/outline/search.svg';
import { FormattedMessage } from 'react-intl';

import ThumbNavigationLink from 'soapbox/components/thumb-navigation-link';
import { useStatContext } from 'soapbox/contexts/stat-context';
import { useAppSelector, useFeatures, useOwnAccount } from 'soapbox/hooks';

const ThumbNavigation: React.FC = (): JSX.Element => {
  const { account } = useOwnAccount();
  const features = useFeatures();

  const { unreadChatsCount } = useStatContext();

  const notificationCount = useAppSelector((state) => state.notifications.unread);
  const dashboardCount = useAppSelector((state) => state.admin.openReports.count() + state.admin.awaitingApproval.count());

  /** Conditionally render the supported messages link */
  const renderMessagesLink = (): React.ReactNode => {
    if (features.chats) {
      return (
        <ThumbNavigationLink
          src={messagesIcon}
          text={<FormattedMessage id='navigation.chats' defaultMessage='Chats' />}
          to='/chats'
          exact
          count={unreadChatsCount}
          countMax={9}
        />
      );
    }

    if (features.directTimeline || features.conversations) {
      return (
        <ThumbNavigationLink
          src={mailIcon}
          activeSrc={mailFilledIcon}
          text={<FormattedMessage id='navigation.direct_messages' defaultMessage='Messages' />}
          to='/messages'
          paths={['/messages', '/conversations']}
        />
      );
    }

    return null;
  };

  return (
    <div className='thumb-navigation'>
      <ThumbNavigationLink
        src={homeIcon}
        activeSrc={homeFilledIcon}
        text={<FormattedMessage id='navigation.home' defaultMessage='Home' />}
        to='/'
        exact
      />

      {features.groups && (
        <ThumbNavigationLink
          src={circlesIcon}
          activeSrc={circlesFilledIcon}
          text={<FormattedMessage id='tabs_bar.groups' defaultMessage='Groups' />}
          to='/groups'
          exact
        />
      )}

      <ThumbNavigationLink
        src={searchIcon}
        text={<FormattedMessage id='navigation.search' defaultMessage='Discover' />}
        to='/search'
        exact
      />

      {account && (
        <ThumbNavigationLink
          src={bellIcon}
          activeSrc={bellFilledIcon}
          text={<FormattedMessage id='navigation.notifications' defaultMessage='Notifications' />}
          to='/notifications'
          exact
          count={notificationCount}
        />
      )}

      {account && renderMessagesLink()}

      {(account && account.staff) && (
        <ThumbNavigationLink
          src={dashboardIcon}
          text={<FormattedMessage id='navigation.dashboard' defaultMessage='Dashboard' />}
          to='/soapbox/admin'
          count={dashboardCount}
        />
      )}
    </div>
  );
};

export default ThumbNavigation;
