import {
  Map as ImmutableMap,
  Record as ImmutableRecord,
  OrderedMap as ImmutableOrderedMap,
  fromJS,
} from 'immutable';

import { normalizeNotification } from 'soapbox/normalizers/notification';
import { validType } from 'soapbox/utils/notification';

import {
  ACCOUNT_BLOCK_SUCCESS,
  ACCOUNT_MUTE_SUCCESS,
  FOLLOW_REQUEST_AUTHORIZE_SUCCESS,
  FOLLOW_REQUEST_REJECT_SUCCESS,
} from '../actions/accounts';
import {
  MARKER_FETCH_SUCCESS,
  MARKER_SAVE_REQUEST,
  MARKER_SAVE_SUCCESS,
} from '../actions/markers';
import {
  NOTIFICATIONS_UPDATE,
  NOTIFICATIONS_EXPAND_SUCCESS,
  NOTIFICATIONS_EXPAND_REQUEST,
  NOTIFICATIONS_EXPAND_FAIL,
  NOTIFICATIONS_FILTER_SET,
  NOTIFICATIONS_CLEAR,
  NOTIFICATIONS_SCROLL_TOP,
  NOTIFICATIONS_UPDATE_QUEUE,
  NOTIFICATIONS_DEQUEUE,
  NOTIFICATIONS_MARK_READ_REQUEST,
  MAX_QUEUED_NOTIFICATIONS,
} from '../actions/notifications';
import { TIMELINE_DELETE } from '../actions/timelines';

import type { AnyAction } from 'redux';
import type { APIEntity } from 'soapbox/types/entities';

const QueuedNotificationRecord = ImmutableRecord({
  notification: {} as APIEntity,
  intlMessages: {} as Record<string, string>,
  intlLocale: '',
});

const ReducerRecord = ImmutableRecord({
  items: ImmutableOrderedMap<string, NotificationRecord>(),
  hasMore: true,
  top: false,
  unread: 0,
  isLoading: false,
  queuedNotifications: ImmutableOrderedMap<string, QueuedNotification>(), //max = MAX_QUEUED_NOTIFICATIONS
  totalQueuedNotificationsCount: 0, //used for queuedItems overflow for MAX_QUEUED_NOTIFICATIONS+
  lastRead: -1 as string | -1,
});

type State = ReturnType<typeof ReducerRecord>;
type NotificationRecord = ReturnType<typeof normalizeNotification>;
type QueuedNotification = ReturnType<typeof QueuedNotificationRecord>;

const parseId = (id: string | number) => parseInt(id as string, 10);

// For sorting the notifications
const comparator = (a: NotificationRecord, b: NotificationRecord) => {
  const parse = (m: NotificationRecord) => parseId(m.id);
  if (parse(a) < parse(b)) return 1;
  if (parse(a) > parse(b)) return -1;
  return 0;
};

const minifyNotification = (notification: NotificationRecord) => {
  return notification.mergeWith((o, n) => n || o, {
    account: notification.getIn(['account', 'id']) as string,
    target: notification.getIn(['target', 'id']) as string,
    status: notification.getIn(['status', 'id']) as string,
  });
};

const fixNotification = (notification: APIEntity) => {
  return minifyNotification(normalizeNotification(notification));
};

const isValid = (notification: APIEntity) => {
  try {
    // Ensure the notification is a known type
    if (!validType(notification.type)) {
      return false;
    }

    // https://gitlab.com/soapbox-pub/soapbox/-/issues/424
    if (!notification.account.get('id')) {
      return false;
    }

    // Mastodon can return status notifications with a null status
    if (['mention', 'reblog', 'favourite', 'poll', 'status'].includes(notification.type) && !notification.getIn(['status', 'id'])) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
};

// Count how many notifications appear after the given ID (for unread count)
const countFuture = (notifications: ImmutableOrderedMap<string, NotificationRecord>, lastId: string | number) => {
  return notifications.reduce((acc, notification) => {
    if (parseId(notification.get('id')) > parseId(lastId)) {
      return acc + 1;
    } else {
      return acc;
    }
  }, 0);
};

const importNotification = (state: State, notification: APIEntity) => {
  const top = state.top;

  if (!top) state = state.update('unread', unread => unread + 1);

  return state.update('items', map => {
    if (top && map.size > 40) {
      map = map.take(20);
    }

    return map.set(notification.id, fixNotification(notification)).sort(comparator);
  });
};

export const processRawNotifications = (notifications: APIEntity[]) => (
  ImmutableOrderedMap(
    notifications
      .map(normalizeNotification)
      .filter(isValid)
      .map(n => [n.id, fixNotification(n)]),
  ));

const expandNormalizedNotifications = (state: State, notifications: APIEntity[], next: string | null) => {
  const items = processRawNotifications(notifications);

  return state.withMutations(mutable => {
    mutable.update('items', map => map.merge(items).sort(comparator));

    if (!next) mutable.set('hasMore', false);
    mutable.set('isLoading', false);
  });
};

const filterNotifications = (state: State, relationship: APIEntity) => {
  return state.update('items', map => map.filterNot(item => item !== null && item.account === relationship.id));
};

const filterNotificationIds = (state: State, accountIds: Array<string>, type?: string) => {
  const helper = (list: ImmutableOrderedMap<string, NotificationRecord>) => list.filterNot(item => item !== null && accountIds.includes(item.account as string) && (type === undefined || type === item.type));
  return state.update('items', helper);
};

const updateTop = (state: State, top: boolean) => {
  if (top) state = state.set('unread', 0);
  return state.set('top', top);
};

const deleteByStatus = (state: State, statusId: string) => {
  return state.update('items', map => map.filterNot(item => item !== null && item.status === statusId));
};

const updateNotificationsQueue = (state: State, notification: APIEntity, intlMessages: Record<string, string>, intlLocale: string) => {
  const queuedNotifications = state.queuedNotifications;
  const listedNotifications = state.items;
  const totalQueuedNotificationsCount = state.totalQueuedNotificationsCount;

  const alreadyExists = queuedNotifications.has(notification.id) || listedNotifications.has(notification.id);
  if (alreadyExists) return state;

  const newQueuedNotifications = queuedNotifications;

  return state.withMutations(mutable => {
    if (totalQueuedNotificationsCount <= MAX_QUEUED_NOTIFICATIONS) {
      mutable.set('queuedNotifications', newQueuedNotifications.set(notification.id, QueuedNotificationRecord({
        notification,
        intlMessages,
        intlLocale,
      })));
    }
    mutable.set('totalQueuedNotificationsCount', totalQueuedNotificationsCount + 1);
  });
};

const importMarker = (state: State, marker: ImmutableMap<string, any>) => {
  const lastReadId = marker.getIn(['notifications', 'last_read_id'], -1) as string | -1;

  if (!lastReadId) {
    return state;
  }

  return state.withMutations(state => {
    const notifications = state.items;
    const unread = countFuture(notifications, lastReadId);

    state.set('unread', unread);
    state.set('lastRead', lastReadId);
  });
};

export default function notifications(state: State = ReducerRecord(), action: AnyAction) {
  switch (action.type) {
    case NOTIFICATIONS_EXPAND_REQUEST:
      return state.set('isLoading', true);
    case NOTIFICATIONS_EXPAND_FAIL:
      return state.set('isLoading', false);
    case NOTIFICATIONS_FILTER_SET:
      return state.set('items', ImmutableOrderedMap()).set('hasMore', true);
    case NOTIFICATIONS_SCROLL_TOP:
      return updateTop(state, action.top);
    case NOTIFICATIONS_UPDATE:
      return importNotification(state, action.notification);
    case NOTIFICATIONS_UPDATE_QUEUE:
      return updateNotificationsQueue(state, action.notification, action.intlMessages, action.intlLocale);
    case NOTIFICATIONS_DEQUEUE:
      return state.withMutations(mutable => {
        mutable.delete('queuedNotifications');
        mutable.set('totalQueuedNotificationsCount', 0);
      });
    case NOTIFICATIONS_EXPAND_SUCCESS:
      return expandNormalizedNotifications(state, action.notifications, action.next);
    case ACCOUNT_BLOCK_SUCCESS:
      return filterNotifications(state, action.relationship);
    case ACCOUNT_MUTE_SUCCESS:
      return action.relationship.muting_notifications ? filterNotifications(state, action.relationship) : state;
    case FOLLOW_REQUEST_AUTHORIZE_SUCCESS:
    case FOLLOW_REQUEST_REJECT_SUCCESS:
      return filterNotificationIds(state, [action.id], 'follow_request');
    case NOTIFICATIONS_CLEAR:
      return state.set('items', ImmutableOrderedMap()).set('hasMore', false);
    case NOTIFICATIONS_MARK_READ_REQUEST:
      return state.set('lastRead', action.lastRead);
    case MARKER_FETCH_SUCCESS:
    case MARKER_SAVE_REQUEST:
    case MARKER_SAVE_SUCCESS:
      return importMarker(state, ImmutableMap(fromJS(action.marker)));
    case TIMELINE_DELETE:
      return deleteByStatus(state, action.id);
    default:
      return state;
  }
}
