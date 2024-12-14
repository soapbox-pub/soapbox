import { defineMessages, IntlShape } from 'react-intl';

import api from 'soapbox/api/index.ts';
import toast from 'soapbox/toast.tsx';

import { importFetchedAccounts, importFetchedStatus, importFetchedStatuses } from './importer/index.ts';
import { uploadFile } from './media.ts';
import { closeModal, openModal } from './modals.ts';
import {
  STATUS_FETCH_SOURCE_FAIL,
  STATUS_FETCH_SOURCE_REQUEST,
  STATUS_FETCH_SOURCE_SUCCESS,
} from './statuses.ts';

import type { ReducerStatus } from 'soapbox/reducers/statuses.ts';
import type { AppDispatch, RootState } from 'soapbox/store.ts';
import type { APIEntity, Status as StatusEntity } from 'soapbox/types/entities.ts';

const LOCATION_SEARCH_REQUEST = 'LOCATION_SEARCH_REQUEST' as const;
const LOCATION_SEARCH_SUCCESS = 'LOCATION_SEARCH_SUCCESS' as const;
const LOCATION_SEARCH_FAIL    = 'LOCATION_SEARCH_FAIL' as const;

const EDIT_EVENT_NAME_CHANGE              = 'EDIT_EVENT_NAME_CHANGE' as const;
const EDIT_EVENT_DESCRIPTION_CHANGE       = 'EDIT_EVENT_DESCRIPTION_CHANGE' as const;
const EDIT_EVENT_START_TIME_CHANGE        = 'EDIT_EVENT_START_TIME_CHANGE' as const;
const EDIT_EVENT_HAS_END_TIME_CHANGE      = 'EDIT_EVENT_HAS_END_TIME_CHANGE' as const;
const EDIT_EVENT_END_TIME_CHANGE          = 'EDIT_EVENT_END_TIME_CHANGE' as const;
const EDIT_EVENT_APPROVAL_REQUIRED_CHANGE = 'EDIT_EVENT_APPROVAL_REQUIRED_CHANGE' as const;
const EDIT_EVENT_LOCATION_CHANGE          = 'EDIT_EVENT_LOCATION_CHANGE' as const;

const EVENT_BANNER_UPLOAD_REQUEST  = 'EVENT_BANNER_UPLOAD_REQUEST' as const;
const EVENT_BANNER_UPLOAD_PROGRESS = 'EVENT_BANNER_UPLOAD_PROGRESS' as const;
const EVENT_BANNER_UPLOAD_SUCCESS  = 'EVENT_BANNER_UPLOAD_SUCCESS' as const;
const EVENT_BANNER_UPLOAD_FAIL     = 'EVENT_BANNER_UPLOAD_FAIL' as const;
const EVENT_BANNER_UPLOAD_UNDO     = 'EVENT_BANNER_UPLOAD_UNDO' as const;

const EVENT_SUBMIT_REQUEST = 'EVENT_SUBMIT_REQUEST' as const;
const EVENT_SUBMIT_SUCCESS = 'EVENT_SUBMIT_SUCCESS' as const;
const EVENT_SUBMIT_FAIL    = 'EVENT_SUBMIT_FAIL' as const;

const EVENT_JOIN_REQUEST = 'EVENT_JOIN_REQUEST' as const;
const EVENT_JOIN_SUCCESS = 'EVENT_JOIN_SUCCESS' as const;
const EVENT_JOIN_FAIL    = 'EVENT_JOIN_FAIL' as const;

const EVENT_LEAVE_REQUEST = 'EVENT_LEAVE_REQUEST' as const;
const EVENT_LEAVE_SUCCESS = 'EVENT_LEAVE_SUCCESS' as const;
const EVENT_LEAVE_FAIL    = 'EVENT_LEAVE_FAIL' as const;

const EVENT_PARTICIPATIONS_FETCH_REQUEST = 'EVENT_PARTICIPATIONS_FETCH_REQUEST' as const;
const EVENT_PARTICIPATIONS_FETCH_SUCCESS = 'EVENT_PARTICIPATIONS_FETCH_SUCCESS' as const;
const EVENT_PARTICIPATIONS_FETCH_FAIL    = 'EVENT_PARTICIPATIONS_FETCH_FAIL' as const;

const EVENT_PARTICIPATIONS_EXPAND_REQUEST = 'EVENT_PARTICIPATIONS_EXPAND_REQUEST' as const;
const EVENT_PARTICIPATIONS_EXPAND_SUCCESS = 'EVENT_PARTICIPATIONS_EXPAND_SUCCESS' as const;
const EVENT_PARTICIPATIONS_EXPAND_FAIL    = 'EVENT_PARTICIPATIONS_EXPAND_FAIL' as const;

const EVENT_PARTICIPATION_REQUESTS_FETCH_REQUEST = 'EVENT_PARTICIPATION_REQUESTS_FETCH_REQUEST' as const;
const EVENT_PARTICIPATION_REQUESTS_FETCH_SUCCESS = 'EVENT_PARTICIPATION_REQUESTS_FETCH_SUCCESS' as const;
const EVENT_PARTICIPATION_REQUESTS_FETCH_FAIL    = 'EVENT_PARTICIPATION_REQUESTS_FETCH_FAIL' as const;

const EVENT_PARTICIPATION_REQUESTS_EXPAND_REQUEST = 'EVENT_PARTICIPATION_REQUESTS_EXPAND_REQUEST' as const;
const EVENT_PARTICIPATION_REQUESTS_EXPAND_SUCCESS = 'EVENT_PARTICIPATION_REQUESTS_EXPAND_SUCCESS' as const;
const EVENT_PARTICIPATION_REQUESTS_EXPAND_FAIL    = 'EVENT_PARTICIPATION_REQUESTS_EXPAND_FAIL' as const;

const EVENT_PARTICIPATION_REQUEST_AUTHORIZE_REQUEST = 'EVENT_PARTICIPATION_REQUEST_AUTHORIZE_REQUEST' as const;
const EVENT_PARTICIPATION_REQUEST_AUTHORIZE_SUCCESS = 'EVENT_PARTICIPATION_REQUEST_AUTHORIZE_SUCCESS' as const;
const EVENT_PARTICIPATION_REQUEST_AUTHORIZE_FAIL    = 'EVENT_PARTICIPATION_REQUEST_AUTHORIZE_FAIL' as const;

const EVENT_PARTICIPATION_REQUEST_REJECT_REQUEST = 'EVENT_PARTICIPATION_REQUEST_REJECT_REQUEST' as const;
const EVENT_PARTICIPATION_REQUEST_REJECT_SUCCESS = 'EVENT_PARTICIPATION_REQUEST_REJECT_SUCCESS' as const;
const EVENT_PARTICIPATION_REQUEST_REJECT_FAIL    = 'EVENT_PARTICIPATION_REQUEST_REJECT_FAIL' as const;

const EVENT_COMPOSE_CANCEL = 'EVENT_COMPOSE_CANCEL' as const;

const EVENT_FORM_SET = 'EVENT_FORM_SET' as const;

const RECENT_EVENTS_FETCH_REQUEST = 'RECENT_EVENTS_FETCH_REQUEST' as const;
const RECENT_EVENTS_FETCH_SUCCESS = 'RECENT_EVENTS_FETCH_SUCCESS' as const;
const RECENT_EVENTS_FETCH_FAIL = 'RECENT_EVENTS_FETCH_FAIL' as const;
const JOINED_EVENTS_FETCH_REQUEST = 'JOINED_EVENTS_FETCH_REQUEST' as const;
const JOINED_EVENTS_FETCH_SUCCESS = 'JOINED_EVENTS_FETCH_SUCCESS' as const;
const JOINED_EVENTS_FETCH_FAIL = 'JOINED_EVENTS_FETCH_FAIL' as const;

const noOp = () => new Promise(f => f(undefined));

const messages = defineMessages({
  exceededImageSizeLimit: { id: 'upload_error.image_size_limit', defaultMessage: 'Image exceeds the current file size limit ({limit})' },
  success: { id: 'compose_event.submit_success', defaultMessage: 'Your event was created' },
  editSuccess: { id: 'compose_event.edit_success', defaultMessage: 'Your event was edited' },
  joinSuccess: { id: 'join_event.success', defaultMessage: 'Joined the event' },
  joinRequestSuccess: { id: 'join_event.request_success', defaultMessage: 'Requested to join the event' },
  view: { id: 'toast.view', defaultMessage: 'View' },
  authorized: { id: 'compose_event.participation_requests.authorize_success', defaultMessage: 'User accepted' },
  rejected: { id: 'compose_event.participation_requests.reject_success', defaultMessage: 'User rejected' },
});

const locationSearch = (query: string, signal?: AbortSignal) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: LOCATION_SEARCH_REQUEST, query });
    return api(getState).get('/api/v1/pleroma/search/location', { searchParams: { q: query }, signal }).then((response) => response.json()).then((locations) => {
      dispatch({ type: LOCATION_SEARCH_SUCCESS, locations });
      return locations;
    }).catch(error => {
      dispatch({ type: LOCATION_SEARCH_FAIL });
      throw error;
    });
  };

const changeEditEventName = (value: string) => ({
  type: EDIT_EVENT_NAME_CHANGE,
  value,
});

const changeEditEventDescription = (value: string) => ({
  type: EDIT_EVENT_DESCRIPTION_CHANGE,
  value,
});

const changeEditEventStartTime = (value: Date) => ({
  type: EDIT_EVENT_START_TIME_CHANGE,
  value,
});

const changeEditEventEndTime = (value: Date) => ({
  type: EDIT_EVENT_END_TIME_CHANGE,
  value,
});

const changeEditEventHasEndTime = (value: boolean) => ({
  type: EDIT_EVENT_HAS_END_TIME_CHANGE,
  value,
});

const changeEditEventApprovalRequired = (value: boolean) => ({
  type: EDIT_EVENT_APPROVAL_REQUIRED_CHANGE,
  value,
});

const changeEditEventLocation = (value: string | null) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    let location = null;

    if (value) {
      location = getState().locations.get(value);
    }

    dispatch({
      type: EDIT_EVENT_LOCATION_CHANGE,
      value: location,
    });
  };

const uploadEventBanner = (file: File, intl: IntlShape) =>
  (dispatch: AppDispatch) => {
    let progress = 0;

    dispatch(uploadEventBannerRequest());

    dispatch(uploadFile(
      file,
      intl,
      (data) => dispatch(uploadEventBannerSuccess(data, file)),
      (error) => dispatch(uploadEventBannerFail(error)),
      ({ loaded }: ProgressEvent) => {
        progress = loaded;
        dispatch(uploadEventBannerProgress(progress));
      },
    ));
  };

const uploadEventBannerRequest = () => ({
  type: EVENT_BANNER_UPLOAD_REQUEST,
});

const uploadEventBannerProgress = (loaded: number) => ({
  type: EVENT_BANNER_UPLOAD_PROGRESS,
  loaded,
});

const uploadEventBannerSuccess = (media: APIEntity, file: File) => ({
  type: EVENT_BANNER_UPLOAD_SUCCESS,
  media,
  file,
});

const uploadEventBannerFail = (error: unknown) => ({
  type: EVENT_BANNER_UPLOAD_FAIL,
  error,
});

const undoUploadEventBanner = () => ({
  type: EVENT_BANNER_UPLOAD_UNDO,
});

const submitEvent = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();

    const id        = state.compose_event.id;
    const name      = state.compose_event.name;
    const status    = state.compose_event.status;
    const banner    = state.compose_event.banner;
    const startTime = state.compose_event.start_time;
    const endTime   = state.compose_event.end_time;
    const joinMode  = state.compose_event.approval_required ? 'restricted' : 'free';
    const location  = state.compose_event.location;

    if (!name || !name.length) {
      return;
    }

    dispatch(submitEventRequest());

    const params: Record<string, any> = {
      name,
      status,
      start_time: startTime,
      join_mode: joinMode,
      content_type: 'text/markdown',
    };

    if (endTime)  params.end_time    = endTime;
    if (banner)   params.banner_id   = banner.id;
    if (location) params.location_id = location.origin_id;

    const method = id === null ? 'POST' : 'PUT';
    const path = id === null ? '/api/v1/pleroma/events' : `/api/v1/pleroma/events/${id}`;

    return api(getState).request(method, path, params).then((response) => response.json()).then((data) => {
      dispatch(closeModal('COMPOSE_EVENT'));
      dispatch(importFetchedStatus(data));
      dispatch(submitEventSuccess(data));
      toast.success(
        id ? messages.editSuccess : messages.success,
        {
          actionLabel: messages.view,
          actionLink: `/@${data.account.acct}/events/${data.id}`,
        },
      );
    }).catch(function(error) {
      dispatch(submitEventFail(error));
    });
  };

const submitEventRequest = () => ({
  type: EVENT_SUBMIT_REQUEST,
});

const submitEventSuccess = (status: APIEntity) => ({
  type: EVENT_SUBMIT_SUCCESS,
  status,
});

const submitEventFail = (error: unknown) => ({
  type: EVENT_SUBMIT_FAIL,
  error,
});

const joinEvent = (id: string, participationMessage?: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const status = getState().statuses.get(id);

    if (!status || !status.event || status.event.join_state) {
      return dispatch(noOp);
    }

    dispatch(joinEventRequest(status));

    return api(getState).post(`/api/v1/pleroma/events/${id}/join`, {
      participation_message: participationMessage,
    }).then((response) => response.json()).then((data) => {
      dispatch(importFetchedStatus(data));
      dispatch(joinEventSuccess(data));
      toast.success(
        data.pleroma.event?.join_state === 'pending' ? messages.joinRequestSuccess : messages.joinSuccess,
        {
          actionLabel: messages.view,
          actionLink: `/@${data.account.acct}/events/${data.id}`,
        },
      );
    }).catch(function(error) {
      dispatch(joinEventFail(error, status, status?.event?.join_state || null));
    });
  };

const joinEventRequest = (status: StatusEntity) => ({
  type: EVENT_JOIN_REQUEST,
  id: status.id,
});

const joinEventSuccess = (status: APIEntity) => ({
  type: EVENT_JOIN_SUCCESS,
  id: status.id,
});

const joinEventFail = (error: unknown, status: StatusEntity, previousState: string | null) => ({
  type: EVENT_JOIN_FAIL,
  error,
  id: status.id,
  previousState,
});

const leaveEvent = (id: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const status = getState().statuses.get(id);

    if (!status || !status.event || !status.event.join_state) {
      return dispatch(noOp);
    }

    dispatch(leaveEventRequest(status));

    return api(getState).post(`/api/v1/pleroma/events/${id}/leave`).then((response) => response.json()).then((data) => {
      dispatch(importFetchedStatus(data));
      dispatch(leaveEventSuccess(data));
    }).catch(function(error) {
      dispatch(leaveEventFail(error, status));
    });
  };

const leaveEventRequest = (status: StatusEntity) => ({
  type: EVENT_LEAVE_REQUEST,
  id: status.id,
});

const leaveEventSuccess = (status: APIEntity) => ({
  type: EVENT_LEAVE_SUCCESS,
  id: status.id,
});

const leaveEventFail = (error: unknown, status: StatusEntity) => ({
  type: EVENT_LEAVE_FAIL,
  id: status.id,
  error,
});

const fetchEventParticipations = (id: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(fetchEventParticipationsRequest(id));

    return api(getState).get(`/api/v1/pleroma/events/${id}/participations`).then(async (response) => {
      const next = response.next();
      const data = await response.json();
      dispatch(importFetchedAccounts(data));
      return dispatch(fetchEventParticipationsSuccess(id, data, next));
    }).catch(error => {
      dispatch(fetchEventParticipationsFail(id, error));
    });
  };

const fetchEventParticipationsRequest = (id: string) => ({
  type: EVENT_PARTICIPATIONS_FETCH_REQUEST,
  id,
});

const fetchEventParticipationsSuccess = (id: string, accounts: APIEntity[], next: string | null) => ({
  type: EVENT_PARTICIPATIONS_FETCH_SUCCESS,
  id,
  accounts,
  next,
});

const fetchEventParticipationsFail = (id: string, error: unknown) => ({
  type: EVENT_PARTICIPATIONS_FETCH_FAIL,
  id,
  error,
});

const expandEventParticipations = (id: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const url = getState().user_lists.event_participations.get(id)?.next || null;

    if (url === null) {
      return dispatch(noOp);
    }

    dispatch(expandEventParticipationsRequest(id));

    return api(getState).get(url).then(async (response) => {
      const next = response.next();
      const data = await response.json();
      dispatch(importFetchedAccounts(data));
      return dispatch(expandEventParticipationsSuccess(id, data, next));
    }).catch(error => {
      dispatch(expandEventParticipationsFail(id, error));
    });
  };

const expandEventParticipationsRequest = (id: string) => ({
  type: EVENT_PARTICIPATIONS_EXPAND_REQUEST,
  id,
});

const expandEventParticipationsSuccess = (id: string, accounts: APIEntity[], next: string | null) => ({
  type: EVENT_PARTICIPATIONS_EXPAND_SUCCESS,
  id,
  accounts,
  next,
});

const expandEventParticipationsFail = (id: string, error: unknown) => ({
  type: EVENT_PARTICIPATIONS_EXPAND_FAIL,
  id,
  error,
});

const fetchEventParticipationRequests = (id: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(fetchEventParticipationRequestsRequest(id));

    return api(getState).get(`/api/v1/pleroma/events/${id}/participation_requests`).then(async (response) => {
      const next = response.next();
      const data = await response.json();
      dispatch(importFetchedAccounts(data.map(({ account }: APIEntity) => account)));
      return dispatch(fetchEventParticipationRequestsSuccess(id, data, next));
    }).catch(error => {
      dispatch(fetchEventParticipationRequestsFail(id, error));
    });
  };

const fetchEventParticipationRequestsRequest = (id: string) => ({
  type: EVENT_PARTICIPATION_REQUESTS_FETCH_REQUEST,
  id,
});

const fetchEventParticipationRequestsSuccess = (id: string, participations: APIEntity[], next: string | null) => ({
  type: EVENT_PARTICIPATION_REQUESTS_FETCH_SUCCESS,
  id,
  participations,
  next,
});

const fetchEventParticipationRequestsFail = (id: string, error: unknown) => ({
  type: EVENT_PARTICIPATION_REQUESTS_FETCH_FAIL,
  id,
  error,
});

const expandEventParticipationRequests = (id: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const url = getState().user_lists.event_participations.get(id)?.next || null;

    if (url === null) {
      return dispatch(noOp);
    }

    dispatch(expandEventParticipationRequestsRequest(id));

    return api(getState).get(url).then(async (response) => {
      const next = response.next();
      const data = await response.json();
      dispatch(importFetchedAccounts(data.map(({ account }: APIEntity) => account)));
      return dispatch(expandEventParticipationRequestsSuccess(id, data, next));
    }).catch(error => {
      dispatch(expandEventParticipationRequestsFail(id, error));
    });
  };

const expandEventParticipationRequestsRequest = (id: string) => ({
  type: EVENT_PARTICIPATION_REQUESTS_EXPAND_REQUEST,
  id,
});

const expandEventParticipationRequestsSuccess = (id: string, participations: APIEntity[], next: string | null) => ({
  type: EVENT_PARTICIPATION_REQUESTS_EXPAND_SUCCESS,
  id,
  participations,
  next,
});

const expandEventParticipationRequestsFail = (id: string, error: unknown) => ({
  type: EVENT_PARTICIPATION_REQUESTS_EXPAND_FAIL,
  id,
  error,
});

const authorizeEventParticipationRequest = (id: string, accountId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(authorizeEventParticipationRequestRequest(id, accountId));

    return api(getState)
      .post(`/api/v1/pleroma/events/${id}/participation_requests/${accountId}/authorize`)
      .then(() => {
        dispatch(authorizeEventParticipationRequestSuccess(id, accountId));
        toast.success(messages.authorized);
      })
      .catch(error => dispatch(authorizeEventParticipationRequestFail(id, accountId, error)));
  };

const authorizeEventParticipationRequestRequest = (id: string, accountId: string) => ({
  type: EVENT_PARTICIPATION_REQUEST_AUTHORIZE_REQUEST,
  id,
  accountId,
});

const authorizeEventParticipationRequestSuccess = (id: string, accountId: string) => ({
  type: EVENT_PARTICIPATION_REQUEST_AUTHORIZE_SUCCESS,
  id,
  accountId,
});

const authorizeEventParticipationRequestFail = (id: string, accountId: string, error: unknown) => ({
  type: EVENT_PARTICIPATION_REQUEST_AUTHORIZE_FAIL,
  id,
  accountId,
  error,
});

const rejectEventParticipationRequest = (id: string, accountId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(rejectEventParticipationRequestRequest(id, accountId));

    return api(getState)
      .post(`/api/v1/pleroma/events/${id}/participation_requests/${accountId}/reject`)
      .then(() => {
        dispatch(rejectEventParticipationRequestSuccess(id, accountId));
        toast.success(messages.rejected);
      })
      .catch(error => dispatch(rejectEventParticipationRequestFail(id, accountId, error)));
  };

const rejectEventParticipationRequestRequest = (id: string, accountId: string) => ({
  type: EVENT_PARTICIPATION_REQUEST_REJECT_REQUEST,
  id,
  accountId,
});

const rejectEventParticipationRequestSuccess = (id: string, accountId: string) => ({
  type: EVENT_PARTICIPATION_REQUEST_REJECT_SUCCESS,
  id,
  accountId,
});

const rejectEventParticipationRequestFail = (id: string, accountId: string, error: unknown) => ({
  type: EVENT_PARTICIPATION_REQUEST_REJECT_FAIL,
  id,
  accountId,
  error,
});

const fetchEventIcs = (id: string) =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    api(getState).get(`/api/v1/pleroma/events/${id}/ics`);

const cancelEventCompose = () => ({
  type: EVENT_COMPOSE_CANCEL,
});

interface EventFormSetAction {
  type: typeof EVENT_FORM_SET;
  status: ReducerStatus;
  text: string;
  location: Record<string, any>;
}

const editEvent = (id: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  const status = getState().statuses.get(id)!;

  dispatch({ type: STATUS_FETCH_SOURCE_REQUEST });

  api(getState).get(`/api/v1/statuses/${id}/source`).then((response) => response.json()).then((data) => {
    dispatch({ type: STATUS_FETCH_SOURCE_SUCCESS });
    dispatch({
      type: EVENT_FORM_SET,
      status,
      text: data.text,
      location: data.location,
    });
    dispatch(openModal('COMPOSE_EVENT'));
  }).catch(error => {
    dispatch({ type: STATUS_FETCH_SOURCE_FAIL, error });
  });
};

const fetchRecentEvents = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (getState().status_lists.get('recent_events')?.isLoading) {
      return;
    }

    dispatch({ type: RECENT_EVENTS_FETCH_REQUEST });

    api(getState).get('/api/v1/timelines/public?only_events=true').then(async (response) => {
      const next = response.next();
      const data = await response.json();

      dispatch(importFetchedStatuses(data));
      dispatch({
        type: RECENT_EVENTS_FETCH_SUCCESS,
        statuses: data,
        next,
      });
    }).catch(error => {
      dispatch({ type: RECENT_EVENTS_FETCH_FAIL, error });
    });
  };

const fetchJoinedEvents = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (getState().status_lists.get('joined_events')?.isLoading) {
      return;
    }

    dispatch({ type: JOINED_EVENTS_FETCH_REQUEST });

    api(getState).get('/api/v1/pleroma/events/joined_events').then(async (response) => {
      const next = response.next();
      const data = await response.json();

      dispatch(importFetchedStatuses(data));
      dispatch({
        type: JOINED_EVENTS_FETCH_SUCCESS,
        statuses: data,
        next,
      });
    }).catch(error => {
      dispatch({ type: JOINED_EVENTS_FETCH_FAIL, error });
    });
  };

type EventsAction =
  | ReturnType<typeof cancelEventCompose>
  | EventFormSetAction;

export {
  LOCATION_SEARCH_REQUEST,
  LOCATION_SEARCH_SUCCESS,
  LOCATION_SEARCH_FAIL,
  EDIT_EVENT_NAME_CHANGE,
  EDIT_EVENT_DESCRIPTION_CHANGE,
  EDIT_EVENT_START_TIME_CHANGE,
  EDIT_EVENT_END_TIME_CHANGE,
  EDIT_EVENT_HAS_END_TIME_CHANGE,
  EDIT_EVENT_APPROVAL_REQUIRED_CHANGE,
  EDIT_EVENT_LOCATION_CHANGE,
  EVENT_BANNER_UPLOAD_REQUEST,
  EVENT_BANNER_UPLOAD_PROGRESS,
  EVENT_BANNER_UPLOAD_SUCCESS,
  EVENT_BANNER_UPLOAD_FAIL,
  EVENT_BANNER_UPLOAD_UNDO,
  EVENT_SUBMIT_REQUEST,
  EVENT_SUBMIT_SUCCESS,
  EVENT_SUBMIT_FAIL,
  EVENT_JOIN_REQUEST,
  EVENT_JOIN_SUCCESS,
  EVENT_JOIN_FAIL,
  EVENT_LEAVE_REQUEST,
  EVENT_LEAVE_SUCCESS,
  EVENT_LEAVE_FAIL,
  EVENT_PARTICIPATIONS_FETCH_REQUEST,
  EVENT_PARTICIPATIONS_FETCH_SUCCESS,
  EVENT_PARTICIPATIONS_FETCH_FAIL,
  EVENT_PARTICIPATIONS_EXPAND_REQUEST,
  EVENT_PARTICIPATIONS_EXPAND_SUCCESS,
  EVENT_PARTICIPATIONS_EXPAND_FAIL,
  EVENT_PARTICIPATION_REQUESTS_FETCH_REQUEST,
  EVENT_PARTICIPATION_REQUESTS_FETCH_SUCCESS,
  EVENT_PARTICIPATION_REQUESTS_FETCH_FAIL,
  EVENT_PARTICIPATION_REQUESTS_EXPAND_REQUEST,
  EVENT_PARTICIPATION_REQUESTS_EXPAND_SUCCESS,
  EVENT_PARTICIPATION_REQUESTS_EXPAND_FAIL,
  EVENT_PARTICIPATION_REQUEST_AUTHORIZE_REQUEST,
  EVENT_PARTICIPATION_REQUEST_AUTHORIZE_SUCCESS,
  EVENT_PARTICIPATION_REQUEST_AUTHORIZE_FAIL,
  EVENT_PARTICIPATION_REQUEST_REJECT_REQUEST,
  EVENT_PARTICIPATION_REQUEST_REJECT_SUCCESS,
  EVENT_PARTICIPATION_REQUEST_REJECT_FAIL,
  EVENT_COMPOSE_CANCEL,
  EVENT_FORM_SET,
  RECENT_EVENTS_FETCH_REQUEST,
  RECENT_EVENTS_FETCH_SUCCESS,
  RECENT_EVENTS_FETCH_FAIL,
  JOINED_EVENTS_FETCH_REQUEST,
  JOINED_EVENTS_FETCH_SUCCESS,
  JOINED_EVENTS_FETCH_FAIL,
  locationSearch,
  changeEditEventName,
  changeEditEventDescription,
  changeEditEventStartTime,
  changeEditEventEndTime,
  changeEditEventHasEndTime,
  changeEditEventApprovalRequired,
  changeEditEventLocation,
  uploadEventBanner,
  uploadEventBannerRequest,
  uploadEventBannerProgress,
  uploadEventBannerSuccess,
  uploadEventBannerFail,
  undoUploadEventBanner,
  submitEvent,
  submitEventRequest,
  submitEventSuccess,
  submitEventFail,
  joinEvent,
  joinEventRequest,
  joinEventSuccess,
  joinEventFail,
  leaveEvent,
  leaveEventRequest,
  leaveEventSuccess,
  leaveEventFail,
  fetchEventParticipations,
  fetchEventParticipationsRequest,
  fetchEventParticipationsSuccess,
  fetchEventParticipationsFail,
  expandEventParticipations,
  expandEventParticipationsRequest,
  expandEventParticipationsSuccess,
  expandEventParticipationsFail,
  fetchEventParticipationRequests,
  fetchEventParticipationRequestsRequest,
  fetchEventParticipationRequestsSuccess,
  fetchEventParticipationRequestsFail,
  expandEventParticipationRequests,
  expandEventParticipationRequestsRequest,
  expandEventParticipationRequestsSuccess,
  expandEventParticipationRequestsFail,
  authorizeEventParticipationRequest,
  authorizeEventParticipationRequestRequest,
  authorizeEventParticipationRequestSuccess,
  authorizeEventParticipationRequestFail,
  rejectEventParticipationRequest,
  rejectEventParticipationRequestRequest,
  rejectEventParticipationRequestSuccess,
  rejectEventParticipationRequestFail,
  fetchEventIcs,
  cancelEventCompose,
  editEvent,
  fetchRecentEvents,
  fetchJoinedEvents,
  type EventsAction,
};
