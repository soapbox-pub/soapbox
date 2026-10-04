import { normalizeNotification } from '@/normalizers/notification.ts';
import { validType } from '@/utils/notification.ts';

import {
  ACCOUNT_BLOCK_SUCCESS,
  ACCOUNT_MUTE_SUCCESS,
  FOLLOW_REQUEST_AUTHORIZE_SUCCESS,
  FOLLOW_REQUEST_REJECT_SUCCESS,
} from '../actions/accounts.ts';
import {
  MARKER_FETCH_SUCCESS,
  MARKER_SAVE_REQUEST,
  MARKER_SAVE_SUCCESS,
} from '../actions/markers.ts';
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
} from '../actions/notifications.ts';
import { TIMELINE_DELETE } from '../actions/timelines.ts';

import type { APIEntity } from '@/types/entities.ts';
import type { AnyAction } from 'redux';

export interface QueuedNotification {
  notification: APIEntity;
  intlMessages: Record<string, string>;
  intlLocale: string;
}

export interface ReducerNotification extends Omit<NotificationRecord, 'account' | 'target' | 'status'> {
  account: string | null;
  target: string | null;
  status: string | null;
}

interface State {
  /** Notifications, sorted newest first. */
  items: ReducerNotification[];
  hasMore: boolean;
  top: boolean;
  unread: number;
  isLoading: boolean;
  queuedNotifications: QueuedNotification[]; //max = MAX_QUEUED_NOTIFICATIONS
  totalQueuedNotificationsCount: number; //used for queuedItems overflow for MAX_QUEUED_NOTIFICATIONS+
  lastRead: string | -1;
}

const initialState: State = {
  items: [],
  hasMore: true,
  top: false,
  unread: 0,
  isLoading: false,
  queuedNotifications: [],
  totalQueuedNotificationsCount: 0,
  lastRead: -1,
};

type NotificationRecord = ReturnType<typeof normalizeNotification>;

const parseId = (id: string | number) => parseInt(id as string, 10);

// For sorting the notifications
const comparator = (a: ReducerNotification, b: ReducerNotification) => {
  const parse = (m: ReducerNotification) => parseId(m.id);
  if (parse(a) < parse(b)) return 1;
  if (parse(a) > parse(b)) return -1;
  return 0;
};

/** Replace an embedded entity with its ID, keeping an existing ID if it has none. */
const minifyEmbedded = (entity: unknown): string | null => {
  if (typeof entity === 'string') return entity;
  return (entity as { id?: string } | null)?.id ?? null;
};

const minifyNotification = (notification: NotificationRecord): ReducerNotification => {
  return {
    ...notification,
    account: minifyEmbedded(notification.account),
    target: minifyEmbedded(notification.target),
    status: minifyEmbedded(notification.status),
  };
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
    if (!notification.account.id) {
      return false;
    }

    // Mastodon can return status notifications with a null status
    if (['mention', 'reblog', 'favourite', 'poll', 'status'].includes(notification.type) && !notification.status?.id) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
};

// Count how many notifications appear after the given ID (for unread count)
const countFuture = (notifications: ReducerNotification[], lastId: string | number) => {
  return notifications.reduce((acc, notification) => {
    if (parseId(notification.id) > parseId(lastId)) {
      return acc + 1;
    } else {
      return acc;
    }
  }, 0);
};

/** Merge notifications into the list, replacing existing ones by ID, and sort them. */
const mergeNotifications = (items: ReducerNotification[], newItems: ReducerNotification[]): ReducerNotification[] => {
  const map = new Map(items.map(item => [item.id, item]));

  newItems.forEach(item => {
    map.set(item.id, item);
  });

  return [...map.values()].sort(comparator);
};

const importNotification = (state: State, notification: APIEntity): State => {
  const top = state.top;
  let items = state.items;

  if (top && items.length > 40) {
    items = items.slice(0, 20);
  }

  return {
    ...state,
    unread: top ? state.unread : state.unread + 1,
    items: mergeNotifications(items, [fixNotification(notification)]),
  };
};

export const processRawNotifications = (notifications: APIEntity[]): ReducerNotification[] => (
  notifications
    .map(normalizeNotification)
    .filter(isValid)
    .map(n => fixNotification(n))
);

const expandNormalizedNotifications = (state: State, notifications: APIEntity[], next: string | null): State => {
  const items = processRawNotifications(notifications);

  return {
    ...state,
    items: mergeNotifications(state.items, items),
    hasMore: next ? state.hasMore : false,
    isLoading: false,
  };
};

const filterNotifications = (state: State, relationship: APIEntity): State => {
  return { ...state, items: state.items.filter(item => item.account !== relationship.id) };
};

const filterNotificationIds = (state: State, accountIds: Array<string>, type?: string): State => {
  return {
    ...state,
    items: state.items.filter(item => !(accountIds.includes(item.account as string) && (type === undefined || type === item.type))),
  };
};

const updateTop = (state: State, top: boolean): State => {
  return {
    ...state,
    unread: top ? 0 : state.unread,
    top,
  };
};

const deleteByStatus = (state: State, statusId: string): State => {
  return { ...state, items: state.items.filter(item => item.status !== statusId) };
};

const updateNotificationsQueue = (state: State, notification: APIEntity, intlMessages: Record<string, string>, intlLocale: string): State => {
  const queuedNotifications = state.queuedNotifications;
  const listedNotifications = state.items;
  const totalQueuedNotificationsCount = state.totalQueuedNotificationsCount;

  const alreadyExists = queuedNotifications.some(queued => queued.notification.id === notification.id)
    || listedNotifications.some(item => item.id === notification.id);

  if (alreadyExists) return state;

  return {
    ...state,
    queuedNotifications: totalQueuedNotificationsCount <= MAX_QUEUED_NOTIFICATIONS
      ? [...queuedNotifications, { notification, intlMessages, intlLocale }]
      : queuedNotifications,
    totalQueuedNotificationsCount: totalQueuedNotificationsCount + 1,
  };
};

const importMarker = (state: State, marker: APIEntity): State => {
  const lastReadId = (marker?.notifications?.last_read_id ?? -1) as string | -1;

  if (!lastReadId) {
    return state;
  }

  return {
    ...state,
    unread: countFuture(state.items, lastReadId),
    lastRead: lastReadId,
  };
};

export default function notifications(state: State = initialState, action: AnyAction): State {
  switch (action.type) {
    case NOTIFICATIONS_EXPAND_REQUEST:
      return { ...state, isLoading: true };
    case NOTIFICATIONS_EXPAND_FAIL:
      return { ...state, isLoading: false };
    case NOTIFICATIONS_FILTER_SET:
      return { ...state, items: [], hasMore: true };
    case NOTIFICATIONS_SCROLL_TOP:
      return updateTop(state, action.top);
    case NOTIFICATIONS_UPDATE:
      return importNotification(state, action.notification);
    case NOTIFICATIONS_UPDATE_QUEUE:
      return updateNotificationsQueue(state, action.notification, action.intlMessages, action.intlLocale);
    case NOTIFICATIONS_DEQUEUE:
      return { ...state, queuedNotifications: [], totalQueuedNotificationsCount: 0 };
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
      return { ...state, items: [], hasMore: false };
    case NOTIFICATIONS_MARK_READ_REQUEST:
      return { ...state, lastRead: action.lastRead };
    case MARKER_FETCH_SUCCESS:
    case MARKER_SAVE_REQUEST:
    case MARKER_SAVE_SUCCESS:
      return importMarker(state, action.marker);
    case TIMELINE_DELETE:
      return deleteByStatus(state, action.id);
    default:
      return state;
  }
}
