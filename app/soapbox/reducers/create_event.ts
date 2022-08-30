import { fromJS, Record as ImmutableRecord } from 'immutable';
import { AnyAction } from 'redux';

import {
  CREATE_EVENT_APPROVAL_REQUIRED_CHANGE,
  CREATE_EVENT_DESCRIPTION_CHANGE,
  CREATE_EVENT_END_TIME_CHANGE,
  CREATE_EVENT_HAS_END_TIME_CHANGE,
  CREATE_EVENT_LOCATION_CHANGE,
  CREATE_EVENT_NAME_CHANGE,
  CREATE_EVENT_START_TIME_CHANGE,
  EVENT_BANNER_UPLOAD_REQUEST,
  EVENT_BANNER_UPLOAD_PROGRESS,
  EVENT_BANNER_UPLOAD_SUCCESS,
  EVENT_BANNER_UPLOAD_FAIL,
  EVENT_BANNER_UPLOAD_UNDO,
  EVENT_SUBMIT_REQUEST,
  EVENT_SUBMIT_SUCCESS,
  EVENT_SUBMIT_FAIL,
} from 'soapbox/actions/events';
import { normalizeAttachment } from 'soapbox/normalizers';

import type {
  Attachment as AttachmentEntity,
  Location as LocationEntity,
} from 'soapbox/types/entities';

export const ReducerRecord = ImmutableRecord({
  name: '',
  status: '',
  location: null as LocationEntity | null,
  start_time: new Date(),
  end_time: null as Date | null,
  approval_required: false,
  banner: null as AttachmentEntity | null,
  progress: 0,
  is_uploading: false,
  is_submitting: false,
});

type State = ReturnType<typeof ReducerRecord>;

const setHasEndTime = (state: State) => {
  const endTime = new Date(state.start_time);

  endTime.setHours(endTime.getHours() + 2);

  return state.set('end_time', endTime);
};

export default function create_event(state = ReducerRecord(), action: AnyAction): State {
  switch (action.type) {
    case CREATE_EVENT_NAME_CHANGE:
      return state.set('name', action.value);
    case CREATE_EVENT_DESCRIPTION_CHANGE:
      return state.set('status', action.value);
    case CREATE_EVENT_START_TIME_CHANGE:
      return state.set('start_time', action.value);
    case CREATE_EVENT_END_TIME_CHANGE:
      return state.set('end_time', action.value);
    case CREATE_EVENT_HAS_END_TIME_CHANGE:
      if (action.value) return setHasEndTime(state);
      return state.set('end_time', null);
    case CREATE_EVENT_APPROVAL_REQUIRED_CHANGE:
      return state.set('approval_required', action.value);
    case CREATE_EVENT_LOCATION_CHANGE:
      return state.set('location', action.value);
    case EVENT_BANNER_UPLOAD_REQUEST:
      return state.set('is_uploading', true);
    case EVENT_BANNER_UPLOAD_SUCCESS:
      return state.set('banner', normalizeAttachment(fromJS(action.media)));
    case EVENT_BANNER_UPLOAD_FAIL:
      return state.set('is_uploading', false);
    case EVENT_BANNER_UPLOAD_UNDO:
      return state.set('banner', null);
    case EVENT_BANNER_UPLOAD_PROGRESS:
      return state.set('progress', action.loaded * 100);
    case EVENT_SUBMIT_REQUEST:
      return state.set('is_submitting', true);
    case EVENT_SUBMIT_SUCCESS:
    case EVENT_SUBMIT_FAIL:
      return state.set('is_submitting', false);
    default:
      return state;
  }
}
