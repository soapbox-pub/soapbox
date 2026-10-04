import { sample } from 'es-toolkit';
import { produce, type Draft } from 'immer';

import {
  ACCOUNT_BLOCK_SUCCESS,
  ACCOUNT_MUTE_SUCCESS,
} from '../actions/accounts.ts';
import {
  STATUS_CREATE_REQUEST,
  STATUS_CREATE_SUCCESS,
} from '../actions/statuses.ts';
import {
  TIMELINE_UPDATE,
  TIMELINE_DELETE,
  TIMELINE_CLEAR,
  TIMELINE_EXPAND_SUCCESS,
  TIMELINE_EXPAND_REQUEST,
  TIMELINE_EXPAND_FAIL,
  TIMELINE_CONNECT,
  TIMELINE_DISCONNECT,
  TIMELINE_UPDATE_QUEUE,
  TIMELINE_DEQUEUE,
  MAX_QUEUED_ITEMS,
  TIMELINE_SCROLL_TOP,
  TIMELINE_INSERT,
} from '../actions/timelines.ts';

import type { ImportPosition } from '@/entity-store/types.ts';
import type { ReducerStatus } from '@/reducers/statuses.ts';
import type { APIEntity } from '@/types/entities.ts';
import type { AnyAction } from 'redux';

const TRUNCATE_LIMIT = 40;
const TRUNCATE_SIZE = 20;

export interface Timeline {
  unread: number;
  online: boolean;
  top: boolean;
  isLoading: boolean;
  hasMore: boolean;
  next: string | undefined;
  prev: string | undefined;
  items: string[];
  queuedItems: string[]; //max= MAX_QUEUED_ITEMS
  totalQueuedItemsCount: number; //used for queuedItems overflow for MAX_QUEUED_ITEMS+
  loadingFailed: boolean;
  isPartial: boolean;
}

export const newTimeline = (timeline: Partial<Timeline> = {}): Timeline => ({
  unread: 0,
  online: false,
  top: true,
  isLoading: false,
  hasMore: true,
  next: undefined,
  prev: undefined,
  items: [],
  queuedItems: [],
  totalQueuedItemsCount: 0,
  loadingFailed: false,
  isPartial: false,
  ...timeline,
});

type State = Record<string, Timeline>;

const initialState: State = {};

const getStatusIds = (statuses: APIEntity[] = []): string[] => (
  [...new Set(statuses.map(status => status.id as string))]
);

/** Merge two lists of IDs, keeping `newIds` first and dropping duplicates. */
const mergeStatusIds = (oldIds: readonly string[] = [], newIds: readonly string[] = []): string[] => (
  [...new Set([...newIds, ...oldIds])]
);

const addStatusId = (oldIds: readonly string[] = [], newId: string): string[] => (
  mergeStatusIds(oldIds, [newId])
);

// Like `take`, but only if the collection's size exceeds truncateLimit
const truncate = (items: string[], truncateLimit: number, newSize: number): string[] => (
  items.length > truncateLimit ? items.slice(0, newSize) : items
);

const truncateIds = (items: string[]) => truncate(items, TRUNCATE_LIMIT, TRUNCATE_SIZE);

/** Get a timeline from the draft, creating it if it doesn't exist. */
const getTimeline = (draft: Draft<State>, timelineId: string): Draft<Timeline> => {
  draft[timelineId] ??= newTimeline();
  return draft[timelineId];
};

/** Update a timeline, creating it if it doesn't exist. */
const updateTimelineState = (state: State, timelineId: string, recipe: (timeline: Draft<Timeline>) => void): State => {
  return produce(state, draft => {
    recipe(getTimeline(draft, timelineId));
  });
};

const setLoading = (state: State, timelineId: string, loading: boolean) => {
  return updateTimelineState(state, timelineId, timeline => {
    timeline.isLoading = loading;
  });
};

const expandNormalizedTimeline = (
  state: State,
  timelineId: string,
  statuses: APIEntity[],
  next: string | undefined,
  prev: string | undefined,
  isPartial: boolean,
  isLoadingRecent: boolean,
  pos: ImportPosition = 'end',
) => {
  const newIds = getStatusIds(statuses);

  return updateTimelineState(state, timelineId, timeline => {
    timeline.isLoading = false;
    timeline.loadingFailed = false;
    timeline.isPartial = isPartial;
    timeline.next = next;
    timeline.prev = prev;

    if (!next && !isLoadingRecent) timeline.hasMore = false;

    // Pinned timelines can be replaced entirely
    if (timelineId.endsWith(':pinned')) {
      timeline.items = newIds;
      return;
    }

    if (newIds.length > 0) {
      if (pos === 'end') {
        timeline.items = mergeStatusIds(newIds, timeline.items);
      } else {
        timeline.items = mergeStatusIds(timeline.items, newIds);
      }
    }
  });
};

const updateTimeline = (draft: Draft<State>, timelineId: string, statusId: string) => {
  const top = draft[timelineId]?.top;
  const oldIds = draft[timelineId]?.items || [];
  const unread = draft[timelineId]?.unread || 0;

  if (oldIds.includes(statusId)) return;

  const newIds = addStatusId(oldIds, statusId);
  const timeline = getTimeline(draft, timelineId);

  if (top) {
    // For performance, truncate items if user is scrolled to the top
    timeline.items = truncateIds(newIds);
  } else {
    timeline.unread = unread + 1;
    timeline.items = newIds;
  }
};

const updateTimelineQueue = (draft: Draft<State>, timelineId: string, statusId: string) => {
  const queuedIds = draft[timelineId]?.queuedItems || [];
  const listedIds = draft[timelineId]?.items || [];
  const queuedCount = draft[timelineId]?.totalQueuedItemsCount || 0;

  if (queuedIds.includes(statusId)) return;
  if (listedIds.includes(statusId)) return;

  const timeline = getTimeline(draft, timelineId);
  timeline.totalQueuedItemsCount = queuedCount + 1;
  timeline.queuedItems = addStatusId(queuedIds, statusId).slice(0, MAX_QUEUED_ITEMS);
};

const shouldDelete = (timelineId: string, excludeAccount?: string) => {
  if (!excludeAccount) return true;
  if (timelineId === `account:${excludeAccount}`) return false;
  if (timelineId.startsWith(`account:${excludeAccount}:`)) return false;
  return true;
};

const deleteStatus = (draft: Draft<State>, statusId: string, references: Array<[string, string]>, excludeAccount?: string) => {
  Object.entries(draft).forEach(([timelineId, timeline]) => {
    if (shouldDelete(timelineId, excludeAccount)) {
      timeline.items = timeline.items.filter(id => id !== statusId);
      timeline.queuedItems = timeline.queuedItems.filter(id => id !== statusId);
    }
  });

  // Remove reblogs of deleted status
  references.forEach(ref => {
    deleteStatus(draft, ref[0], [], excludeAccount);
  });
};

const updateTop = (state: State, timelineId: string, top: boolean) => {
  return updateTimelineState(state, timelineId, timeline => {
    if (top) timeline.unread = 0;
    timeline.top = top;
  });
};

const isReblogOf = (reblog: ReducerStatus, status: ReducerStatus) => reblog.reblog === status.id;
const statusToReference = (status: ReducerStatus): [string, string] => [status.id, status.account?.id];

const buildReferencesTo = (statuses: Record<string, ReducerStatus>, status: ReducerStatus) => (
  Object.values(statuses)
    .filter(reblog => isReblogOf(reblog, status))
    .map(statusToReference)
);

const filterTimelines = (state: State, relationship: APIEntity, statuses: Record<string, ReducerStatus>) => {
  return produce(state, draft => {
    Object.values(statuses).forEach(status => {
      if (status.account?.id !== relationship.id) return;
      const references = buildReferencesTo(statuses, status);
      deleteStatus(draft, status.id, references, relationship.id);
    });
  });
};

const timelineDequeue = (state: State, timelineId: string) => {
  const top = state[timelineId]?.top;

  return updateTimelineState(state, timelineId, timeline => {
    const newIds = mergeStatusIds(timeline.items, timeline.queuedItems);
    timeline.items = top ? truncateIds(newIds) : newIds;
    timeline.queuedItems = [];
    timeline.totalQueuedItemsCount = 0;
  });
};

const timelineConnect = (state: State, timelineId: string) => {
  return updateTimelineState(state, timelineId, timeline => {
    timeline.online = true;
  });
};

const timelineDisconnect = (state: State, timelineId: string) => {
  return updateTimelineState(state, timelineId, timeline => {
    timeline.online = false;

    // This is causing problems. Disable for now.
    // https://gitlab.com/soapbox-pub/soapbox/-/issues/716
    // timeline.items = addStatusId(timeline.items, null);
  });
};

const getTimelinesForStatus = (status: APIEntity) => {
  switch (status.visibility) {
    case 'group':
      return [`group:${status.group?.id || status.group_id}`];
    case 'direct':
      return ['direct'];
    case 'public':
      return ['home', 'community', 'public'];
    default:
      return ['home'];
  }
};

// Given a list of unique IDs, replace oldId with newId maintaining its position
const replaceId = (ids: string[], oldId: string, newId: string): string[] => {
  const index = ids.indexOf(oldId);

  if (index > -1) {
    return [...new Set(ids.map(id => id === oldId ? newId : id))];
  } else {
    return ids;
  }
};

const importPendingStatus = (state: State, params: APIEntity, idempotencyKey: string) => {
  const statusId = `末pending-${idempotencyKey}`;

  return produce(state, draft => {
    const timelineIds = getTimelinesForStatus(params);

    timelineIds.forEach(timelineId => {
      updateTimelineQueue(draft, timelineId, statusId);
    });
  });
};

const replacePendingStatus = (draft: Draft<State>, idempotencyKey: string, newId: string) => {
  const oldId = `末pending-${idempotencyKey}`;

  // Loop through timelines and replace the pending status with the real one
  Object.values(draft).forEach(timeline => {
    timeline.items = replaceId(timeline.items, oldId, newId);
    timeline.queuedItems = replaceId(timeline.queuedItems, oldId, newId);
  });
};

const importStatus = (state: State, status: APIEntity, idempotencyKey: string) => {
  return produce(state, draft => {
    replacePendingStatus(draft, idempotencyKey, status.id);

    const timelineIds = getTimelinesForStatus(status);

    timelineIds.forEach(timelineId => {
      updateTimeline(draft, timelineId, status.id);
    });
  });
};

const handleExpandFail = (state: State, timelineId: string) => {
  return updateTimelineState(state, timelineId, timeline => {
    timeline.isLoading = false;
    timeline.loadingFailed = true;
  });
};

export default function timelines(state: State = initialState, action: AnyAction): State {
  switch (action.type) {
    case STATUS_CREATE_REQUEST:
      if (action.params.scheduled_at) return state;
      return importPendingStatus(state, action.params, action.idempotencyKey);
    case STATUS_CREATE_SUCCESS:
      if (action.status.scheduled_at || action.editing) return state;
      return importStatus(state, action.status, action.idempotencyKey);
    case TIMELINE_EXPAND_REQUEST:
      return setLoading(state, action.timeline, true);
    case TIMELINE_EXPAND_FAIL:
      return handleExpandFail(state, action.timeline);
    case TIMELINE_EXPAND_SUCCESS:
      return expandNormalizedTimeline(
        state,
        action.timeline,
        action.statuses,
        action.next,
        action.prev,
        action.partial,
        action.isLoadingRecent,
      );
    case TIMELINE_UPDATE:
      return produce(state, draft => updateTimeline(draft, action.timeline, action.statusId));
    case TIMELINE_UPDATE_QUEUE:
      return produce(state, draft => updateTimelineQueue(draft, action.timeline, action.statusId));
    case TIMELINE_DEQUEUE:
      return timelineDequeue(state, action.timeline);
    case TIMELINE_DELETE:
      return produce(state, draft => deleteStatus(draft, action.id, action.references, action.reblogOf));
    case TIMELINE_CLEAR:
      return { ...state, [action.timeline]: newTimeline() };
    case ACCOUNT_BLOCK_SUCCESS:
    case ACCOUNT_MUTE_SUCCESS:
      return filterTimelines(state, action.relationship, action.statuses);
    case TIMELINE_SCROLL_TOP:
      return updateTop(state, action.timeline, action.top);
    case TIMELINE_CONNECT:
      return timelineConnect(state, action.timeline);
    case TIMELINE_DISCONNECT:
      return timelineDisconnect(state, action.timeline);
    case TIMELINE_INSERT:
      return updateTimelineState(state, action.timeline, timeline => {
        const oldIds = timeline.items;
        let oldIdsArray = [...oldIds];
        const existingSuggestionId = oldIdsArray.find(key => key.includes('末suggestions'));

        if (existingSuggestionId) {
          oldIdsArray = oldIdsArray.slice(1);
        }
        const positionInTimeline = sample([5, 6, 7, 8, 9]) as number;
        const last = oldIds[oldIds.length - 1];
        if (last) {
          oldIdsArray.splice(positionInTimeline, 0, `末suggestions-${last}`);
        }
        timeline.items = [...new Set(oldIdsArray)];
      });
    default:
      return state;
  }
}
