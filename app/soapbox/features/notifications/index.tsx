import classNames from 'classnames';
import { List as ImmutableList } from 'immutable';
import { debounce } from 'lodash';
import React, { useEffect, useRef } from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';
import { useDispatch } from 'react-redux';
import { createSelector } from 'reselect';

import { getSettings } from 'soapbox/actions/settings';
import BirthdayReminders from 'soapbox/components/birthday_reminders';
import PlaceholderNotification from 'soapbox/features/placeholder/components/placeholder_notification';
import { useAppSelector, useFeatures, useSettings } from 'soapbox/hooks';

import {
  expandNotifications,
  scrollTopNotifications,
  dequeueNotifications,
} from '../../actions/notifications';
import LoadGap from '../../components/load_gap';
import ScrollableList from '../../components/scrollable_list';
import TimelineQueueButtonHeader from  '../../components/timeline_queue_button_header';
import { Column } from '../../components/ui';

import Notification from './components/notification';
import FilterBarContainer from './containers/filter_bar_container';

import type { RootState } from 'soapbox/store';
import type { Notification as NotificationEntity } from 'soapbox/types/entities';

const messages = defineMessages({
  title: { id: 'column.notifications', defaultMessage: 'Notifications' },
  queue: { id: 'notifications.queue_label', defaultMessage: 'Click to see {count} new {count, plural, one {notification} other {notifications}}' },
});

const getNotifications = createSelector([
  (state: RootState) => getSettings(state).getIn(['notifications', 'quickFilter', 'show']),
  (state: RootState) => getSettings(state).getIn(['notifications', 'quickFilter', 'active']),
  (state: RootState) => ImmutableList((getSettings(state).getIn(['notifications', 'shows']) as any).filter((item: any) => !item).keys()),
  (state: RootState) => state.notifications.items.toList() as ImmutableList<NotificationEntity>,
], (showFilterBar, allowedType, excludedTypes, notifications) => {
  if (!showFilterBar || allowedType === 'all') {
    // used if user changed the notification settings after loading the notifications from the server
    // otherwise a list of notifications will come pre-filtered from the backend
    // we need to turn it off for FilterBar in order not to block ourselves from seeing a specific category
    return notifications.filterNot(item => item !== null && excludedTypes.includes(item.type));
  }
  return notifications.filter(item => item !== null && allowedType === item.type);
});

const Notifications: React.FC = () => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const settings = useSettings();
  const features = useFeatures();

  const column = useRef<HTMLDivElement>(null);
  const scrollableContent = useRef<React.ReactNode[] | null>(null);

  const showBirthdayReminders = settings.getIn(['notifications', 'birthdays', 'show']) && settings.getIn(['notifications', 'quickFilter', 'active']) === 'all' && features.birthdays;
  const birthdays = useAppSelector(state => showBirthdayReminders && state.user_lists.getIn(['birthday_reminders', state.me]));

  const showFilterBar = settings.getIn(['notifications', 'quickFilter', 'show']);
  const notifications = useAppSelector(state => getNotifications(state));
  const isLoading     = useAppSelector(state => !!state.notifications.isLoading);
  const hasMore       =   useAppSelector(state => !!state.notifications.hasMore);
  const hasBirthdays  = !!birthdays;

  const totalQueuedNotificationsCount = useAppSelector(state => state.notifications.totalQueuedNotificationsCount || 0);

  useEffect(() => {
    handleDequeueNotifications();
    dispatch(scrollTopNotifications(true));

    return () => {
      handleLoadOlder.cancel();
      handleScrollToTop.cancel();
      handleScroll.cancel();
      dispatch(scrollTopNotifications(false));
    };
  });

  const handleLoadGap = (maxId: string) => {
    dispatch(expandNotifications({ maxId }));
  };

  const handleLoadOlder = debounce(() => {
    const last = notifications.last();
    dispatch(expandNotifications({ maxId: last && last.id }));
  }, 300, { leading: true });

  const handleScrollToTop = debounce(() => {
    dispatch(scrollTopNotifications(true));
  }, 100);

  const handleScroll = debounce(() => {
    dispatch(scrollTopNotifications(false));
  }, 100);

  const handleMoveUp = (id: string) => {
    let elementIndex = notifications.findIndex(item => item !== null && item.id === id) - 1;
    if (hasBirthdays) elementIndex++;
    _selectChild(elementIndex, true);
  };

  const handleMoveDown = (id: string) => {
    let elementIndex = notifications.findIndex(item => item !== null && item.id === id) + 1;
    if (hasBirthdays) elementIndex++;
    _selectChild(elementIndex, false);
  };

  const handleMoveBelowBirthdays = () => {
    _selectChild(1, false);
  };

  const _selectChild = (index: number, align_top: boolean) => {
    const container = column.current;
    if (!container) return;

    const element = container.querySelector(`article:nth-of-type(${index + 1}) .focusable`) as HTMLDivElement | null;

    if (element) {
      if (align_top && container.scrollTop > element.offsetTop) {
        element.scrollIntoView(true);
      } else if (!align_top && container.scrollTop + container.clientHeight < element.offsetTop + element.offsetHeight) {
        element.scrollIntoView(false);
      }
      element.focus();
    }
  };

  const handleDequeueNotifications = () => {
    dispatch(dequeueNotifications());
  };

  const handleRefresh = () => {
    return dispatch(expandNotifications());
  };

  const emptyMessage = <FormattedMessage id='empty_column.notifications' defaultMessage="You don't have any notifications yet. Interact with others to start the conversation." />;

  const filterBarContainer = showFilterBar
    ? (<FilterBarContainer />)
    : null;

  if (isLoading && scrollableContent) {
    // do nothing
  } else if (notifications.size > 0 || hasMore) {
    scrollableContent.current = notifications.map((item, index) => item === null ? [(
      <LoadGap
        key={'gap:' + notifications.getIn([index + 1, 'id'])}
        disabled={isLoading}
        maxId={index > 0 ? notifications.getIn([index - 1, 'id']) : null}
        onClick={handleLoadGap}
      />
    )] : [(
      <Notification
        key={item.id}
        notification={item}
        onMoveUp={handleMoveUp}
        onMoveDown={handleMoveDown}
      />
    )]).toArray();

    if (showBirthdayReminders) scrollableContent.current?.unshift(
      <BirthdayReminders
        key='birthdays'
        onMoveDown={handleMoveBelowBirthdays}
      />,
    );
  } else {
    scrollableContent.current = null;
  }

  const scrollContainer = (
    <ScrollableList
      scrollKey='notifications'
      isLoading={isLoading}
      showLoading={isLoading && notifications.size === 0}
      hasMore={hasMore}
      emptyMessage={emptyMessage}
      placeholderComponent={PlaceholderNotification}
      placeholderCount={20}
      onLoadMore={handleLoadOlder}
      onRefresh={handleRefresh}
      onScrollToTop={handleScrollToTop}
      onScroll={handleScroll}
      className={classNames({
        'divide-y divide-gray-200 dark:divide-gray-600 divide-solid': notifications.size > 0,
        'space-y-2': notifications.size === 0,
      })}
    >
      {scrollableContent.current}
    </ScrollableList>
  );

  return (
    // @ts-ignore
    <Column ref={column} label={intl.formatMessage(messages.title)} withHeader={false}>
      {filterBarContainer}
      <TimelineQueueButtonHeader
        onClick={handleDequeueNotifications}
        count={totalQueuedNotificationsCount}
        message={messages.queue}
      />
      {scrollContainer}
    </Column>
  );
};

export default Notifications;
