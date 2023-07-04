import { Map as ImmutableMap, OrderedSet as ImmutableOrderedSet } from 'immutable';

import { getSettings } from 'soapbox/actions/settings';
import { normalizeStatus } from 'soapbox/normalizers';
import { shouldFilter } from 'soapbox/utils/timelines';

import api, { getNextLink, getPrevLink } from '../api';

import { fetchGroupRelationships } from './groups';
import { importFetchedStatus, importFetchedStatuses } from './importer';

import type { AxiosError } from 'axios';
import type { AppDispatch, RootState } from 'soapbox/store';
import type { APIEntity, Status } from 'soapbox/types/entities';

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

const TIMELINE_REPLACE = 'TIMELINE_REPLACE' as const;
const TIMELINE_INSERT = 'TIMELINE_INSERT' as const;
const TIMELINE_CLEAR_FEED_ACCOUNT_ID = 'TIMELINE_CLEAR_FEED_ACCOUNT_ID' as const;

const MAX_QUEUED_ITEMS = 40;

const processTimelineUpdate = (timeline: string, status: APIEntity, accept: ((status: APIEntity) => boolean) | null) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const me = getState().me;
    const ownStatus = status.account?.id === me;
    const hasPendingStatuses = !getState().pending_statuses.isEmpty();

    const columnSettings = getSettings(getState()).get(timeline, ImmutableMap());
    const shouldSkipQueue = shouldFilter(normalizeStatus(status) as Status, columnSettings as any);

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
    const queuedCount = state.timelines.get(timelineId)?.totalQueuedItemsCount || 0;

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
        dispatch(expandHomeTimeline(optionalExpandArgs));
      } else if (timelineId === 'community') {
        dispatch(clearTimeline(timelineId));
        dispatch(expandCommunityTimeline(optionalExpandArgs));
      }
    }
  };

interface TimelineDeleteAction {
  type: typeof TIMELINE_DELETE
  id: string
  accountId: string
  references: ImmutableMap<string, readonly [statusId: string, accountId: string]>
  reblogOf: unknown
}

const deleteFromTimelines = (id: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const accountId = getState().statuses.get(id)?.account?.id!;
    const references = getState().statuses.filter(status => status.reblog === id).map(status => [status.id, status.account.id] as const);
    const reblogOf = getState().statuses.getIn([id, 'reblog'], null);

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

const replaceHomeTimeline = (
  accountId: string | undefined,
  { maxId }: Record<string, any> = {},
  done?: () => void,
) => (dispatch: AppDispatch, _getState: () => RootState) => {
  dispatch({ type: TIMELINE_REPLACE, accountId });
  dispatch(expandHomeTimeline({ accountId, maxId }, () => {
    dispatch(insertSuggestionsIntoTimeline());
    if (done) {
      done();
    }
  }));
};

const expandTimeline = (timelineId: string, path: string, params: Record<string, any> = {}, done = noOp) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const timeline = getState().timelines.get(timelineId) || {} as Record<string, any>;
    const isLoadingMore = !!params.max_id;

    if (timeline.isLoading) {
      done();
      return dispatch(noOpAsync());
    }

    if (
      !params.max_id &&
      !params.pinned &&
      (timeline.items || ImmutableOrderedSet()).size > 0 &&
      !path.includes('max_id=')
    ) {
      params.since_id = timeline.getIn(['items', 0]);
    }

    const isLoadingRecent = !!params.since_id;

    dispatch(expandTimelineRequest(timelineId, isLoadingMore));

    return api(getState).get(path, { params }).then(response => {
      dispatch(importFetchedStatuses(response.data));

      const statusesFromGroups = (response.data as Status[]).filter((status) => !!status.group);
      dispatch(fetchGroupRelationships(statusesFromGroups.map((status: any) => status.group?.id)));

      dispatch(expandTimelineSuccess(
        timelineId,
        response.data,
        getNextLink(response),
        getPrevLink(response),
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

interface ExpandHomeTimelineOpts {
  accountId?: string
  maxId?: string
  url?: string
}

interface HomeTimelineParams {
  max_id?: string
  exclude_replies?: boolean
  with_muted?: boolean
}

const expandHomeTimeline = ({ url, accountId, maxId }: ExpandHomeTimelineOpts = {}, done = noOp) => {
  const endpoint = url || (accountId ? `/api/v1/accounts/${accountId}/statuses` : '/api/v1/timelines/home');
  const params: HomeTimelineParams = {};

  if (!url && maxId) {
    params.max_id = maxId;
  }

  if (accountId) {
    params.exclude_replies = true;
    params.with_muted = true;
  }

  return expandTimeline('home', endpoint, params, done);
};

const expandPublicTimeline = ({ url, maxId, onlyMedia }: Record<string, any> = {}, done = noOp) =>
  expandTimeline(`public${onlyMedia ? ':media' : ''}`, url || '/api/v1/timelines/public', url ? {} : { max_id: maxId, only_media: !!onlyMedia }, done);

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
  next: string | undefined,
  prev: string | undefined,
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

const expandTimelineFail = (timeline: string, error: AxiosError, isLoadingMore: boolean) => ({
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

const clearFeedAccountId = () => (dispatch: AppDispatch, _getState: () => RootState) => {
  dispatch({ type: TIMELINE_CLEAR_FEED_ACCOUNT_ID });
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
  TIMELINE_REPLACE,
  TIMELINE_CLEAR_FEED_ACCOUNT_ID,
  TIMELINE_INSERT,
  MAX_QUEUED_ITEMS,
  processTimelineUpdate,
  updateTimeline,
  updateTimelineQueue,
  dequeueTimeline,
  deleteFromTimelines,
  clearTimeline,
  expandTimeline,
  replaceHomeTimeline,
  expandHomeTimeline,
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
  clearFeedAccountId,
  type TimelineAction,
};
