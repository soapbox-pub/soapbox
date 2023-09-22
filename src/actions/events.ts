import { defineMessages, IntlShape } from 'react-intl';

import api, { getLinks } from 'soapbox/api';
import toast from 'soapbox/toast';
import { formatBytes } from 'soapbox/utils/media';
import resizeImage from 'soapbox/utils/resize-image';

import { importFetchedAccounts, importFetchedStatus, importFetchedStatuses } from './importer';
import { fetchMedia, uploadMedia } from './media';
import { closeModal, openModal } from './modals';
import {
  STATUS_FETCH_SOURCE_FAIL,
  STATUS_FETCH_SOURCE_REQUEST,
  STATUS_FETCH_SOURCE_SUCCESS,
} from './statuses';

import type { AxiosError } from 'axios';
import type { AppDispatch, RootState } from 'soapbox/store';
import type { APIEntity, Status as StatusEntity } from 'soapbox/types/entities';

const LOCATION_SEARCH_REQUEST = 'LOCATION_SEARCH_REQUEST';
const LOCATION_SEARCH_SUCCESS = 'LOCATION_SEARCH_SUCCESS';
const LOCATION_SEARCH_FAIL    = 'LOCATION_SEARCH_FAIL';

const EDIT_EVENT_NAME_CHANGE              = 'EDIT_EVENT_NAME_CHANGE';
const EDIT_EVENT_DESCRIPTION_CHANGE       = 'EDIT_EVENT_DESCRIPTION_CHANGE';
const EDIT_EVENT_START_TIME_CHANGE        = 'EDIT_EVENT_START_TIME_CHANGE';
const EDIT_EVENT_HAS_END_TIME_CHANGE      = 'EDIT_EVENT_HAS_END_TIME_CHANGE';
const EDIT_EVENT_END_TIME_CHANGE          = 'EDIT_EVENT_END_TIME_CHANGE';
const EDIT_EVENT_APPROVAL_REQUIRED_CHANGE = 'EDIT_EVENT_APPROVAL_REQUIRED_CHANGE';
const EDIT_EVENT_LOCATION_CHANGE          = 'EDIT_EVENT_LOCATION_CHANGE';

const EVENT_BANNER_UPLOAD_REQUEST  = 'EVENT_BANNER_UPLOAD_REQUEST';
const EVENT_BANNER_UPLOAD_PROGRESS = 'EVENT_BANNER_UPLOAD_PROGRESS';
const EVENT_BANNER_UPLOAD_SUCCESS  = 'EVENT_BANNER_UPLOAD_SUCCESS';
const EVENT_BANNER_UPLOAD_FAIL     = 'EVENT_BANNER_UPLOAD_FAIL';
const EVENT_BANNER_UPLOAD_UNDO     = 'EVENT_BANNER_UPLOAD_UNDO';

const EVENT_SUBMIT_REQUEST = 'EVENT_SUBMIT_REQUEST';
const EVENT_SUBMIT_SUCCESS = 'EVENT_SUBMIT_SUCCESS';
const EVENT_SUBMIT_FAIL    = 'EVENT_SUBMIT_FAIL';

const EVENT_JOIN_REQUEST = 'EVENT_JOIN_REQUEST';
const EVENT_JOIN_SUCCESS = 'EVENT_JOIN_SUCCESS';
const EVENT_JOIN_FAIL    = 'EVENT_JOIN_FAIL';

const EVENT_LEAVE_REQUEST = 'EVENT_LEAVE_REQUEST';
const EVENT_LEAVE_SUCCESS = 'EVENT_LEAVE_SUCCESS';
const EVENT_LEAVE_FAIL    = 'EVENT_LEAVE_FAIL';

const EVENT_PARTICIPATIONS_FETCH_REQUEST = 'EVENT_PARTICIPATIONS_FETCH_REQUEST';
const EVENT_PARTICIPATIONS_FETCH_SUCCESS = 'EVENT_PARTICIPATIONS_FETCH_SUCCESS';
const EVENT_PARTICIPATIONS_FETCH_FAIL    = 'EVENT_PARTICIPATIONS_FETCH_FAIL';

const EVENT_PARTICIPATIONS_EXPAND_REQUEST = 'EVENT_PARTICIPATIONS_EXPAND_REQUEST';
const EVENT_PARTICIPATIONS_EXPAND_SUCCESS = 'EVENT_PARTICIPATIONS_EXPAND_SUCCESS';
const EVENT_PARTICIPATIONS_EXPAND_FAIL    = 'EVENT_PARTICIPATIONS_EXPAND_FAIL';

const EVENT_PARTICIPATION_REQUESTS_FETCH_REQUEST = 'EVENT_PARTICIPATION_REQUESTS_FETCH_REQUEST';
const EVENT_PARTICIPATION_REQUESTS_FETCH_SUCCESS = 'EVENT_PARTICIPATION_REQUESTS_FETCH_SUCCESS';
const EVENT_PARTICIPATION_REQUESTS_FETCH_FAIL    = 'EVENT_PARTICIPATION_REQUESTS_FETCH_FAIL';

const EVENT_PARTICIPATION_REQUESTS_EXPAND_REQUEST = 'EVENT_PARTICIPATION_REQUESTS_EXPAND_REQUEST';
const EVENT_PARTICIPATION_REQUESTS_EXPAND_SUCCESS = 'EVENT_PARTICIPATION_REQUESTS_EXPAND_SUCCESS';
const EVENT_PARTICIPATION_REQUESTS_EXPAND_FAIL    = 'EVENT_PARTICIPATION_REQUESTS_EXPAND_FAIL';

const EVENT_PARTICIPATION_REQUEST_AUTHORIZE_REQUEST = 'EVENT_PARTICIPATION_REQUEST_AUTHORIZE_REQUEST';
const EVENT_PARTICIPATION_REQUEST_AUTHORIZE_SUCCESS = 'EVENT_PARTICIPATION_REQUEST_AUTHORIZE_SUCCESS';
const EVENT_PARTICIPATION_REQUEST_AUTHORIZE_FAIL    = 'EVENT_PARTICIPATION_REQUEST_AUTHORIZE_FAIL';

const EVENT_PARTICIPATION_REQUEST_REJECT_REQUEST = 'EVENT_PARTICIPATION_REQUEST_REJECT_REQUEST';
const EVENT_PARTICIPATION_REQUEST_REJECT_SUCCESS = 'EVENT_PARTICIPATION_REQUEST_REJECT_SUCCESS';
const EVENT_PARTICIPATION_REQUEST_REJECT_FAIL    = 'EVENT_PARTICIPATION_REQUEST_REJECT_FAIL';

const EVENT_COMPOSE_CANCEL = 'EVENT_COMPOSE_CANCEL';

const EVENT_FORM_SET = 'EVENT_FORM_SET';

const RECENT_EVENTS_FETCH_REQUEST = 'RECENT_EVENTS_FETCH_REQUEST';
const RECENT_EVENTS_FETCH_SUCCESS = 'RECENT_EVENTS_FETCH_SUCCESS';
const RECENT_EVENTS_FETCH_FAIL = 'RECENT_EVENTS_FETCH_FAIL';
const JOINED_EVENTS_FETCH_REQUEST = 'JOINED_EVENTS_FETCH_REQUEST';
const JOINED_EVENTS_FETCH_SUCCESS = 'JOINED_EVENTS_FETCH_SUCCESS';
const JOINED_EVENTS_FETCH_FAIL = 'JOINED_EVENTS_FETCH_FAIL';

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
    return api(getState).get('/api/v1/pleroma/search/location', { params: { q: query }, signal }).then(({ data: locations }) => {
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
  (dispatch: AppDispatch, getState: () => RootState) => {
    const maxImageSize = getState().instance.configuration.getIn(['media_attachments', 'image_size_limit']) as number | undefined;

    let progress = 0;

    dispatch(uploadEventBannerRequest());

    if (maxImageSize && (file.size > maxImageSize)) {
      const limit = formatBytes(maxImageSize);
      const message = intl.formatMessage(messages.exceededImageSizeLimit, { limit });
      toast.error(message);
      dispatch(uploadEventBannerFail(true));
      return;
    }

    resizeImage(file).then(file => {
      const data = new FormData();
      data.append('file', file);
      // Account for disparity in size of original image and resized data

      const onUploadProgress = ({ loaded }: any) => {
        progress = loaded;
        dispatch(uploadEventBannerProgress(progress));
      };

      return dispatch(uploadMedia(data, onUploadProgress))
        .then(({ status, data }) => {
          // If server-side processing of the media attachment has not completed yet,
          // poll the server until it is, before showing the media attachment as uploaded
          if (status === 200) {
            dispatch(uploadEventBannerSuccess(data, file));
          } else if (status === 202) {
            const poll = () => {
              dispatch(fetchMedia(data.id)).then(({ status, data }) => {
                if (status === 200) {
                  dispatch(uploadEventBannerSuccess(data, file));
                } else if (status === 206) {
                  setTimeout(() => poll(), 1000);
                }
              }).catch(error => dispatch(uploadEventBannerFail(error)));
            };

            poll();
          }
        });
    }).catch(error => dispatch(uploadEventBannerFail(error)));
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

const uploadEventBannerFail = (error: AxiosError | true) => ({
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

    return api(getState).request({
      url: id === null ? '/api/v1/pleroma/events' : `/api/v1/pleroma/events/${id}`,
      method: id === null ? 'post' : 'put',
      data: params,
    }).then(({ data }) => {
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

const submitEventFail = (error: AxiosError) => ({
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
    }).then(({ data }) => {
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

const joinEventFail = (error: AxiosError, status: StatusEntity, previousState: string | null) => ({
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

    return api(getState).post(`/api/v1/pleroma/events/${id}/leave`).then(({ data }) => {
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

const leaveEventFail = (error: AxiosError, status: StatusEntity) => ({
  type: EVENT_LEAVE_FAIL,
  id: status.id,
  error,
});

const fetchEventParticipations = (id: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(fetchEventParticipationsRequest(id));

    return api(getState).get(`/api/v1/pleroma/events/${id}/participations`).then(response => {
      const next = getLinks(response).refs.find(link => link.rel === 'next');
      dispatch(importFetchedAccounts(response.data));
      return dispatch(fetchEventParticipationsSuccess(id, response.data, next ? next.uri : null));
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

const fetchEventParticipationsFail = (id: string, error: AxiosError) => ({
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

    return api(getState).get(url).then(response => {
      const next = getLinks(response).refs.find(link => link.rel === 'next');
      dispatch(importFetchedAccounts(response.data));
      return dispatch(expandEventParticipationsSuccess(id, response.data, next ? next.uri : null));
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

const expandEventParticipationsFail = (id: string, error: AxiosError) => ({
  type: EVENT_PARTICIPATIONS_EXPAND_FAIL,
  id,
  error,
});

const fetchEventParticipationRequests = (id: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(fetchEventParticipationRequestsRequest(id));

    return api(getState).get(`/api/v1/pleroma/events/${id}/participation_requests`).then(response => {
      const next = getLinks(response).refs.find(link => link.rel === 'next');
      dispatch(importFetchedAccounts(response.data.map(({ account }: APIEntity) => account)));
      return dispatch(fetchEventParticipationRequestsSuccess(id, response.data, next ? next.uri : null));
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

const fetchEventParticipationRequestsFail = (id: string, error: AxiosError) => ({
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

    return api(getState).get(url).then(response => {
      const next = getLinks(response).refs.find(link => link.rel === 'next');
      dispatch(importFetchedAccounts(response.data.map(({ account }: APIEntity) => account)));
      return dispatch(expandEventParticipationRequestsSuccess(id, response.data, next ? next.uri : null));
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

const expandEventParticipationRequestsFail = (id: string, error: AxiosError) => ({
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

const authorizeEventParticipationRequestFail = (id: string, accountId: string, error: AxiosError) => ({
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

const rejectEventParticipationRequestFail = (id: string, accountId: string, error: AxiosError) => ({
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

const editEvent = (id: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  const status = getState().statuses.get(id)!;

  dispatch({ type: STATUS_FETCH_SOURCE_REQUEST });

  api(getState).get(`/api/v1/statuses/${id}/source`).then(response => {
    dispatch({ type: STATUS_FETCH_SOURCE_SUCCESS });
    dispatch({
      type: EVENT_FORM_SET,
      status,
      text: response.data.text,
      location: response.data.location,
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

    api(getState).get('/api/v1/timelines/public?only_events=true').then(response => {
      const next = getLinks(response).refs.find(link => link.rel === 'next');
      dispatch(importFetchedStatuses(response.data));
      dispatch({
        type: RECENT_EVENTS_FETCH_SUCCESS,
        statuses: response.data,
        next: next ? next.uri : null,
      });
    }).catch(error => {
      dispatch({ type: RECENT_EVENTS_FETCH_FAIL,  error });
    });
  };

const fetchJoinedEvents = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (getState().status_lists.get('joined_events')?.isLoading) {
      return;
    }

    dispatch({ type: JOINED_EVENTS_FETCH_REQUEST });

    api(getState).get('/api/v1/pleroma/events/joined_events').then(response => {
      const next = getLinks(response).refs.find(link => link.rel === 'next');
      dispatch(importFetchedStatuses(response.data));
      dispatch({
        type: JOINED_EVENTS_FETCH_SUCCESS,
        statuses: response.data,
        next: next ? next.uri : null,
      });
    }).catch(error => {
      dispatch({ type: JOINED_EVENTS_FETCH_FAIL,  error });
    });
  };

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
};
