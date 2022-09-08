import { defineMessages, IntlShape } from 'react-intl';

import api, { getLinks } from 'soapbox/api';
import { formatBytes } from 'soapbox/utils/media';
import resizeImage from 'soapbox/utils/resize_image';

import { importFetchedAccounts, importFetchedStatus } from './importer';
import { fetchMedia, uploadMedia } from './media';
import { closeModal } from './modals';
import snackbar from './snackbar';

import type { AxiosError } from 'axios';
import type { AppDispatch, RootState } from 'soapbox/store';
import type { APIEntity } from 'soapbox/types/entities';

const LOCATION_SEARCH_REQUEST = 'LOCATION_SEARCH_REQUEST';
const LOCATION_SEARCH_SUCCESS = 'LOCATION_SEARCH_SUCCESS';
const LOCATION_SEARCH_FAIL    = 'LOCATION_SEARCH_FAIL';

const CREATE_EVENT_NAME_CHANGE              = 'CREATE_EVENT_NAME_CHANGE';
const CREATE_EVENT_DESCRIPTION_CHANGE       = 'CREATE_EVENT_DESCRIPTION_CHANGE';
const CREATE_EVENT_START_TIME_CHANGE        = 'CREATE_EVENT_START_TIME_CHANGE';
const CREATE_EVENT_HAS_END_TIME_CHANGE      = 'CREATE_EVENT_HAS_END_TIME_CHANGE';
const CREATE_EVENT_END_TIME_CHANGE          = 'CREATE_EVENT_END_TIME_CHANGE';
const CREATE_EVENT_APPROVAL_REQUIRED_CHANGE = 'CREATE_EVENT_APPROVAL_REQUIRED_CHANGE';
const CREATE_EVENT_LOCATION_CHANGE          = 'CREATE_EVENT_LOCATION_CHANGE';

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

const noOp = () => new Promise(f => f(undefined));

const messages = defineMessages({
  exceededImageSizeLimit: { id: 'upload_error.image_size_limit', defaultMessage: 'Image exceeds the current file size limit ({limit})' },
  success: { id: 'create_event.submit_success', defaultMessage: 'Your event was created' },
  joinSuccess: { id: 'join_event.success', defaultMessage: 'Joined the event' },
  joinRequestSuccess: { id: 'join_event.request_success', defaultMessage: 'Requested to join the event' },
  view: { id: 'snackbar.view', defaultMessage: 'View' },
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

const changeCreateEventName = (value: string) => ({
  type: CREATE_EVENT_NAME_CHANGE,
  value,
});

const changeCreateEventDescription = (value: string) => ({
  type: CREATE_EVENT_DESCRIPTION_CHANGE,
  value,
});

const changeCreateEventStartTime = (value: Date) => ({
  type: CREATE_EVENT_START_TIME_CHANGE,
  value,
});

const changeCreateEventEndTime = (value: Date) => ({
  type: CREATE_EVENT_END_TIME_CHANGE,
  value,
});

const changeCreateEventHasEndTime = (value: boolean) => ({
  type: CREATE_EVENT_HAS_END_TIME_CHANGE,
  value,
});

const changeCreateEventApprovalRequired = (value: boolean) => ({
  type: CREATE_EVENT_APPROVAL_REQUIRED_CHANGE,
  value,
});

const changeCreateEventLocation = (value: string | null) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    let location = null;

    if (value) {
      location = getState().locations.get(value);
    }

    dispatch({
      type: CREATE_EVENT_LOCATION_CHANGE,
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
      dispatch(snackbar.error(message));
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

    const name      = state.create_event.name;
    const status    = state.create_event.status;
    const banner    = state.create_event.banner;
    const startTime = state.create_event.start_time;
    const endTime   = state.create_event.end_time;
    const joinMode  = state.create_event.approval_required ? 'restricted' : 'free';
    const location  = state.create_event.location;

    if (!status || !status.length) {
      return;
    }

    dispatch(submitEventRequest());

    const params: Record<string, any> = {
      name,
      status,
      start_time: startTime,
      join_mode: joinMode,
    };

    if (endTime)  params.end_time    = endTime;
    if (banner)   params.banner_id   = banner.id;
    if (location) params.location_id = location.origin_id;

    return api(getState).post('/api/v1/pleroma/events', params).then(({ data }) => {
      dispatch(closeModal('CREATE_EVENT'));
      dispatch(importFetchedStatus(data));
      dispatch(submitEventSuccess(data));
      dispatch(snackbar.success(messages.success, messages.view, `/@${data.account.acct}/events/${data.id}`));
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

    dispatch(joinEventRequest());

    return api(getState).post(`/api/v1/pleroma/events/${id}/join`, { participationMessage }).then(({ data }) => {
      dispatch(importFetchedStatus(data));
      dispatch(joinEventSuccess(data));
      dispatch(snackbar.success(
        data.pleroma.event?.join_state === 'pending' ? messages.joinRequestSuccess : messages.joinSuccess,
        messages.view,
        `/@${data.account.acct}/events/${data.id}`,
      ));
    }).catch(function(error) {
      dispatch(joinEventFail(error, status?.event?.join_state || null));
    });
  };

const joinEventRequest = () => ({
  type: EVENT_JOIN_REQUEST,
});

const joinEventSuccess = (status: APIEntity) => ({
  type: EVENT_JOIN_SUCCESS,
  status,
});

const joinEventFail = (error: AxiosError, previousState: string | null) => ({
  type: EVENT_JOIN_FAIL,
  error,
  previousState,
});

const leaveEvent = (id: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const status = getState().statuses.get(id);

    if (!status || !status.event || !status.event.join_state) {
      return dispatch(noOp);
    }

    dispatch(leaveEventRequest());

    return api(getState).post(`/api/v1/pleroma/events/${id}/leave`).then(({ data }) => {
      dispatch(importFetchedStatus(data));
      dispatch(leaveEventSuccess(data));
    }).catch(function(error) {
      dispatch(leaveEventFail(error));
    });
  };

const leaveEventRequest = () => ({
  type: EVENT_LEAVE_REQUEST,
});

const leaveEventSuccess = (status: APIEntity) => ({
  type: EVENT_LEAVE_SUCCESS,
  status,
});

const leaveEventFail = (error: AxiosError) => ({
  type: EVENT_LEAVE_FAIL,
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

const fetchEventIcs = (id: string) =>
  (dispatch: any, getState: () => RootState) =>
    api(getState).get(`/api/v1/pleroma/events/${id}/ics`);

export {
  LOCATION_SEARCH_REQUEST,
  LOCATION_SEARCH_SUCCESS,
  LOCATION_SEARCH_FAIL,
  CREATE_EVENT_NAME_CHANGE,
  CREATE_EVENT_DESCRIPTION_CHANGE,
  CREATE_EVENT_START_TIME_CHANGE,
  CREATE_EVENT_END_TIME_CHANGE,
  CREATE_EVENT_HAS_END_TIME_CHANGE,
  CREATE_EVENT_APPROVAL_REQUIRED_CHANGE,
  CREATE_EVENT_LOCATION_CHANGE,
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
  locationSearch,
  changeCreateEventName,
  changeCreateEventDescription,
  changeCreateEventStartTime,
  changeCreateEventEndTime,
  changeCreateEventHasEndTime,
  changeCreateEventApprovalRequired,
  changeCreateEventLocation,
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
  fetchEventIcs,
};
