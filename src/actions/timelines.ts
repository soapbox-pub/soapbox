import { getSettings } from '@/actions/settings.ts';
import { normalizeStatus } from '@/normalizers/index.ts';
import { shouldFilter } from '@/utils/timelines.ts';

import api from '../api/index.ts';

import { fetchGroupRelationships } from './groups.ts';
import { importFetchedStatus, importFetchedStatuses } from './importer/index.ts';

import type { AppDispatch, RootState } from '@/store.ts';
import type { APIEntity, Status } from '@/types/entities.ts';

const TIMELINE_UPDATE = 'TIMELINE_UPDATE' as const;
const TIMELINE_DELETE = 'TIMELINE_DELETE' as const;
const TIMELINE_CLEAR = 'TIMELINE_CLEAR' as const;
const TIMELINE_UPDATE_QUEUE = 'TIMELINE_UPDATE_QUEUE' as const;
const TIMELINE_DEQUEUE = 'TIMELINE_DEQUEUE' as const;
const TIMELINE_SCROLL_TOP = 'TIMELINE_SCROLL_TOP' as const;

const TIMELINE_EXPAND_REQUEST = 'TIMELINE_EXPAND_REQUEST' as const;
const TIMELINE_EXPAND_SUCCESS = 'TIMELINE_EXPAND_SUCCESS' as const;
const TIMELINE_EXPAND_FAIL = 'TIMELINE_EXPAND_FAIL' as const;

const TIMELINE_CONNECT = 'TIMELINE_CONNECT' as const;
const TIMELINE_DISCONNECT = 'TIMELINE_DISCONNECT' as const;

const TIMELINE_INSERT = 'TIMELINE_INSERT' as const;

const MAX_QUEUED_ITEMS = 40;

const processTimelineUpdate = (timeline: string, status: APIEntity, accept: ((status: APIEntity) => boolean) | null) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const me = getState().me;
    const ownStatus = status.account?.id === me;
    const hasPendingStatuses = Object.keys(getState().pending_statuses).length > 0;

    const columnSettings = getSettings(getState())[timeline] as Parameters<typeof shouldFilter>[1];
    const shouldSkipQueue = shouldFilter(normalizeStatus(status), columnSettings);

    if (ownStatus && hasPendingStatuses) {
      // WebSockets push statuses without the Idempotency-Key,
      // so if we have pending statuses, don't import it from here.
      // We implement optimistic non-blocking statuses.
      return;
    }

    dispatch(importFetchedStatus(status));

    if (shouldSkipQueue) {
      dispatch(updateTimeline(timeline, status.id, accept));
    } else {
      dispatch(updateTimelineQueue(timeline, status.id, accept));
    }
  };

const updateTimeline = (timeline: string, statusId: string, accept: ((status: APIEntity) => boolean) | null) =>
  (dispatch: AppDispatch) => {
    // if (typeof accept === 'function' && !accept(status)) {
    //   return;
    // }

    dispatch({
      type: TIMELINE_UPDATE,
      timeline,
      statusId,
    });
  };

const updateTimelineQueue = (timeline: string, statusId: string, accept: ((status: APIEntity) => boolean) | null) =>
  (dispatch: AppDispatch) => {
    // if (typeof accept === 'function' && !accept(status)) {
    //   return;
    // }

    dispatch({
      type: TIMELINE_UPDATE_QUEUE,
      timeline,
      statusId,
    });
  };

const dequeueTimeline = (timelineId: string, expandFunc?: (lastStatusId: string) => void, optionalExpandArgs?: any) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const queuedCount = state.timelines[timelineId]?.totalQueuedItemsCount || 0;

    if (queuedCount <= 0) return;

    if (queuedCount <= MAX_QUEUED_ITEMS) {
      dispatch({ type: TIMELINE_DEQUEUE, timeline: timelineId });
      return;
    }

    if (typeof expandFunc === 'function') {
      dispatch(clearTimeline(timelineId));
      // @ts-ignore
      expandFunc();
    } else {
      if (timelineId === 'home') {
        dispatch(clearTimeline(timelineId));
        dispatch(expandFollowsTimeline(optionalExpandArgs));
      } else if (timelineId === 'community') {
        dispatch(clearTimeline(timelineId));
        dispatch(expandCommunityTimeline(optionalExpandArgs));
      }
    }
  };

interface TimelineDeleteAction {
  type: typeof TIMELINE_DELETE;
  id: string;
  accountId: string;
  references: Array<[statusId: string, accountId: string]>;
  reblogOf: unknown;
}

const deleteFromTimelines = (id: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const accountId = getState().statuses[id]?.account?.id!;
    const references = Object.values(getState().statuses)
      .filter(status => status.reblog === id)
      .map((status): [string, string] => [status.id, status.account.id]);
    const reblogOf = getState().statuses[id]?.reblog ?? null;

    const action: TimelineDeleteAction = {
      type: TIMELINE_DELETE,
      id,
      accountId,
      references,
      reblogOf,
    };

    dispatch(action);
  };

const clearTimeline = (timeline: string) =>
  (dispatch: AppDispatch) =>
    dispatch({ type: TIMELINE_CLEAR, timeline });

const noOp = () => { };
const noOpAsync = () => () => new Promise(f => f(undefined));

const parseTags = (tags: Record<string, any[]> = {}, mode: 'any' | 'all' | 'none') => {
  return (tags[mode] || []).map((tag) => {
    return tag.value;
  });
};

const expandTimeline = (timelineId: string, path: string, params: Record<string, any> = {}, done = noOp) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const timeline = getState().timelines[timelineId];
    const isLoadingMore = !!params.max_id;

    if (timeline?.isLoading) {
      done();
      return dispatch(noOpAsync());
    }

    const isLoadingRecent = !!params.since_id;

    dispatch(expandTimelineRequest(timelineId, isLoadingMore));

    return api(getState).get(path, { searchParams: params }).then(async (response) => {
      const { next, prev } = response.pagination();
      const data: APIEntity[] = await response.json();

      dispatch(importFetchedStatuses(data));

      const statusesFromGroups = (data as Status[]).filter((status) => !!status.group);
      dispatch(fetchGroupRelationships(statusesFromGroups.map((status: any) => status.group?.id)));

      dispatch(expandTimelineSuccess(
        timelineId,
        data,
        next,
        prev,
        response.status === 206,
        isLoadingRecent,
        isLoadingMore,
      ));
      done();
    }).catch(error => {
      dispatch(expandTimelineFail(timelineId, error, isLoadingMore));
      done();
    });
  };

interface ExpandFollowsTimelineOpts {
  maxId?: string;
  url?: string;
}

interface FollowsTimelineParams {
  max_id?: string;
  exclude_replies?: boolean;
  with_muted?: boolean;
}

const expandFollowsTimeline = ({ url, maxId }: ExpandFollowsTimelineOpts = {}, done = noOp) => {
  const endpoint = url || '/api/v1/timelines/home';
  const params: FollowsTimelineParams = {};

  if (!url && maxId) {
    params.max_id = maxId;
  }

  return expandTimeline('home', endpoint, params, done);
};

const expandPublicTimeline = ({ url, maxId, onlyMedia, language }: Record<string, any> = {}, done = noOp) =>
  expandTimeline(`public${onlyMedia ? ':media' : ''}`, url || '/api/v1/timelines/public', url ? {} : { max_id: maxId, only_media: !!onlyMedia, language: language || undefined }, done);

const expandRemoteTimeline = (instance: string, { url, maxId, onlyMedia }: Record<string, any> = {}, done = noOp) =>
  expandTimeline(`remote${onlyMedia ? ':media' : ''}:${instance}`, url || '/api/v1/timelines/public', url ? {} : { local: false, instance: instance, max_id: maxId, only_media: !!onlyMedia }, done);

const expandCommunityTimeline = ({ url, maxId, onlyMedia }: Record<string, any> = {}, done = noOp) =>
  expandTimeline(`community${onlyMedia ? ':media' : ''}`, url || '/api/v1/timelines/public', url ? {} : { local: true, max_id: maxId, only_media: !!onlyMedia }, done);

const expandDirectTimeline = ({ url, maxId }: Record<string, any> = {}, done = noOp) =>
  expandTimeline('direct', url || '/api/v1/timelines/direct', url ? {} : { max_id: maxId }, done);

const expandAccountTimeline = (accountId: string, { url, maxId, withReplies }: Record<string, any> = {}) =>
  expandTimeline(`account:${accountId}${withReplies ? ':with_replies' : ''}`, url || `/api/v1/accounts/${accountId}/statuses`, url ? {} : { exclude_replies: !withReplies, max_id: maxId, with_muted: true });

const expandAccountFeaturedTimeline = (accountId: string) =>
  expandTimeline(`account:${accountId}:pinned`, `/api/v1/accounts/${accountId}/statuses`, { pinned: true, with_muted: true });

const expandAccountMediaTimeline = (accountId: string | number, { url, maxId }: Record<string, any> = {}) =>
  expandTimeline(`account:${accountId}:media`, url || `/api/v1/accounts/${accountId}/statuses`, url ? {} : { max_id: maxId, only_media: true, limit: 40, with_muted: true });

const expandListTimeline = (id: string, { url, maxId }: Record<string, any> = {}, done = noOp) =>
  expandTimeline(`list:${id}`, url || `/api/v1/timelines/list/${id}`, url ? {} : { max_id: maxId }, done);

const expandGroupTimeline = (id: string, { maxId }: Record<string, any> = {}, done = noOp) =>
  expandTimeline(`group:${id}`, `/api/v1/timelines/group/${id}`, { max_id: maxId }, done);

const expandGroupFeaturedTimeline = (id: string) =>
  expandTimeline(`group:${id}:pinned`, `/api/v1/timelines/group/${id}`, { pinned: true });

const expandGroupTimelineFromTag = (id: string, tagName: string, { maxId }: Record<string, any> = {}, done = noOp) =>
  expandTimeline(`group:tags:${id}:${tagName}`, `/api/v1/timelines/group/${id}/tags/${tagName}`, { max_id: maxId }, done);

const expandGroupMediaTimeline = (id: string | number, { maxId }: Record<string, any> = {}) =>
  expandTimeline(`group:${id}:media`, `/api/v1/timelines/group/${id}`, { max_id: maxId, only_media: true, limit: 40, with_muted: true });

const expandHashtagTimeline = (hashtag: string, { url, maxId, tags }: Record<string, any> = {}, done = noOp) => {
  return expandTimeline(`hashtag:${hashtag}`, url || `/api/v1/timelines/tag/${hashtag}`, url ? {} : {
    max_id: maxId,
    any: parseTags(tags, 'any'),
    all: parseTags(tags, 'all'),
    none: parseTags(tags, 'none'),
  }, done);
};

const expandTimelineRequest = (timeline: string, isLoadingMore: boolean) => ({
  type: TIMELINE_EXPAND_REQUEST,
  timeline,
  skipLoading: !isLoadingMore,
});

const expandTimelineSuccess = (
  timeline: string,
  statuses: APIEntity[],
  next: string | null,
  prev: string | null,
  partial: boolean,
  isLoadingRecent: boolean,
  isLoadingMore: boolean,
) => ({
  type: TIMELINE_EXPAND_SUCCESS,
  timeline,
  statuses,
  next,
  prev,
  partial,
  isLoadingRecent,
  skipLoading: !isLoadingMore,
});

const expandTimelineFail = (timeline: string, error: unknown, isLoadingMore: boolean) => ({
  type: TIMELINE_EXPAND_FAIL,
  timeline,
  error,
  skipLoading: !isLoadingMore,
});

const connectTimeline = (timeline: string) => ({
  type: TIMELINE_CONNECT,
  timeline,
});

const disconnectTimeline = (timeline: string) => ({
  type: TIMELINE_DISCONNECT,
  timeline,
});

const scrollTopTimeline = (timeline: string, top: boolean) => ({
  type: TIMELINE_SCROLL_TOP,
  timeline,
  top,
});

const insertSuggestionsIntoTimeline = () => (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch({ type: TIMELINE_INSERT, timeline: 'home' });
};

// TODO: other actions
type TimelineAction = TimelineDeleteAction;

export {
  TIMELINE_UPDATE,
  TIMELINE_DELETE,
  TIMELINE_CLEAR,
  TIMELINE_UPDATE_QUEUE,
  TIMELINE_DEQUEUE,
  TIMELINE_SCROLL_TOP,
  TIMELINE_EXPAND_REQUEST,
  TIMELINE_EXPAND_SUCCESS,
  TIMELINE_EXPAND_FAIL,
  TIMELINE_CONNECT,
  TIMELINE_DISCONNECT,
  TIMELINE_INSERT,
  MAX_QUEUED_ITEMS,
  processTimelineUpdate,
  updateTimeline,
  updateTimelineQueue,
  dequeueTimeline,
  deleteFromTimelines,
  clearTimeline,
  expandTimeline,
  expandFollowsTimeline,
  expandPublicTimeline,
  expandRemoteTimeline,
  expandCommunityTimeline,
  expandDirectTimeline,
  expandAccountTimeline,
  expandAccountFeaturedTimeline,
  expandAccountMediaTimeline,
  expandListTimeline,
  expandGroupTimeline,
  expandGroupFeaturedTimeline,
  expandGroupTimelineFromTag,
  expandGroupMediaTimeline,
  expandHashtagTimeline,
  expandTimelineRequest,
  expandTimelineSuccess,
  expandTimelineFail,
  connectTimeline,
  disconnectTimeline,
  scrollTopTimeline,
  insertSuggestionsIntoTimeline,
  type TimelineAction,
};
