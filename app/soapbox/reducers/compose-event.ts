import { fromJS, Record as ImmutableRecord } from 'immutable';
import { AnyAction } from 'redux';

import {
  EDIT_EVENT_APPROVAL_REQUIRED_CHANGE,
  EDIT_EVENT_DESCRIPTION_CHANGE,
  EDIT_EVENT_END_TIME_CHANGE,
  EDIT_EVENT_HAS_END_TIME_CHANGE,
  EDIT_EVENT_LOCATION_CHANGE,
  EDIT_EVENT_NAME_CHANGE,
  EDIT_EVENT_START_TIME_CHANGE,
  EVENT_BANNER_UPLOAD_REQUEST,
  EVENT_BANNER_UPLOAD_PROGRESS,
  EVENT_BANNER_UPLOAD_SUCCESS,
  EVENT_BANNER_UPLOAD_FAIL,
  EVENT_BANNER_UPLOAD_UNDO,
  EVENT_SUBMIT_REQUEST,
  EVENT_SUBMIT_SUCCESS,
  EVENT_SUBMIT_FAIL,
  EVENT_COMPOSE_CANCEL,
  EVENT_FORM_SET,
} from 'soapbox/actions/events';
import { normalizeAttachment, normalizeLocation } from 'soapbox/normalizers';

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
  id: null as string | null,
});

type State = ReturnType<typeof ReducerRecord>;

const setHasEndTime = (state: State) => {
  const endTime = new Date(state.start_time);

  endTime.setHours(endTime.getHours() + 2);

  return state.set('end_time', endTime);
};

export default function compose_event(state = ReducerRecord(), action: AnyAction): State {
  switch (action.type) {
    case EDIT_EVENT_NAME_CHANGE:
      return state.set('name', action.value);
    case EDIT_EVENT_DESCRIPTION_CHANGE:
      return state.set('status', action.value);
    case EDIT_EVENT_START_TIME_CHANGE:
      return state.set('start_time', action.value);
    case EDIT_EVENT_END_TIME_CHANGE:
      return state.set('end_time', action.value);
    case EDIT_EVENT_HAS_END_TIME_CHANGE:
      if (action.value) return setHasEndTime(state);
      return state.set('end_time', null);
    case EDIT_EVENT_APPROVAL_REQUIRED_CHANGE:
      return state.set('approval_required', action.value);
    case EDIT_EVENT_LOCATION_CHANGE:
      return state.set('location', action.value);
    case EVENT_BANNER_UPLOAD_REQUEST:
      return state.set('is_uploading', true);
    case EVENT_BANNER_UPLOAD_SUCCESS:
      return state
        .set('banner', normalizeAttachment(fromJS(action.media)))
        .set('is_uploading', false);
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
    case EVENT_COMPOSE_CANCEL:
      return ReducerRecord();
    case EVENT_FORM_SET:
      return ReducerRecord({
        name: action.status.event.name,
        status: action.text,
        start_time: new Date(action.status.event.start_time),
        end_time: action.status.event.end_time ? new Date(action.status.event.end_time) : null,
        approval_required: action.status.event.join_mode !== 'free',
        banner: action.status.event.banner || null,
        location: action.location ? normalizeLocation(action.location) : null,
        progress: 0,
        is_uploading: false,
        is_submitting: false,
        id: action.status.id,
      });
    default:
      return state;
  }
}
