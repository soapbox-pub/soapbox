import { defineMessages, IntlShape } from 'react-intl';

import api from 'soapbox/api';
import { formatBytes } from 'soapbox/utils/media';
import resizeImage from 'soapbox/utils/resize_image';

import { importFetchedStatus } from './importer';
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

const messages = defineMessages({
  exceededImageSizeLimit: { id: 'upload_error.image_size_limit', defaultMessage: 'Image exceeds the current file size limit ({limit})' },
  success: { id: 'create_event.submit_success', defaultMessage: 'Your event was created' },
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
  skipLoading: true,
});

const uploadEventBannerProgress = (loaded: number) => ({
  type: EVENT_BANNER_UPLOAD_PROGRESS,
  loaded: loaded,
});

const uploadEventBannerSuccess = (media: APIEntity, file: File) => ({
  type: EVENT_BANNER_UPLOAD_SUCCESS,
  media: media,
  file,
  skipLoading: true,
});

const uploadEventBannerFail = (error: AxiosError | true) => ({
  type: EVENT_BANNER_UPLOAD_FAIL,
  error: error,
  skipLoading: true,
});

const undoUploadEventBanner = () => ({
  type: EVENT_BANNER_UPLOAD_UNDO,
});

const submitEvent = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();

    const name = state.create_event.name;
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

    const idempotencyKey = state.compose.idempotencyKey;

    const params: Record<string, any> = {
      name,
      status,
      start_time: startTime,
      join_mode: joinMode,
    };

    if (endTime) params.end_time = endTime;
    if (banner) params.banner_id = banner.id;
    if (location) params.location_id = location.origin_id;

    return api(getState).post('/api/v1/pleroma/events', params).then(({ data }) => {
      dispatch(closeModal('CREATE_EVENT'));
      dispatch(importFetchedStatus(data, idempotencyKey));
      dispatch(submitEventSuccess(data));
      dispatch(snackbar.success(messages.success, messages.view, `/@${data.account.acct}/posts/${data.id}`));
    }).catch(function(error) {
      dispatch(submitEventFail(error));
    });
  };

const submitEventRequest = () => ({
  type: EVENT_SUBMIT_REQUEST,
});

const submitEventSuccess = (status: APIEntity) => ({
  type: EVENT_SUBMIT_SUCCESS,
  status: status,
});

const submitEventFail = (error: AxiosError) => ({
  type: EVENT_SUBMIT_FAIL,
  error: error,
});

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
};
