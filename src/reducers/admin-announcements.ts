import { List as ImmutableList, Record as ImmutableRecord } from 'immutable';

import {
  ADMIN_ANNOUNCEMENT_CHANGE_ALL_DAY,
  ADMIN_ANNOUNCEMENT_CHANGE_CONTENT,
  ADMIN_ANNOUNCEMENT_CHANGE_END_TIME,
  ADMIN_ANNOUNCEMENT_CHANGE_START_TIME,
  ADMIN_ANNOUNCEMENT_CREATE_FAIL,
  ADMIN_ANNOUNCEMENT_CREATE_REQUEST,
  ADMIN_ANNOUNCEMENT_CREATE_SUCCESS,
  ADMIN_ANNOUNCEMENT_DELETE_SUCCESS,
  ADMIN_ANNOUNCEMENT_MODAL_INIT,
  ADMIN_ANNOUNCEMENTS_FETCH_FAIL,
  ADMIN_ANNOUNCEMENTS_FETCH_REQUEST,
  ADMIN_ANNOUNCEMENTS_FETCH_SUCCESS,
} from 'soapbox/actions/admin';
import { normalizeAnnouncement } from 'soapbox/normalizers';

import type { AnyAction } from 'redux';
import type { Announcement, APIEntity } from 'soapbox/types/entities';

const AnnouncementFormRecord = ImmutableRecord({
  id: null as string | null,
  content: '',
  starts_at: null as Date | null,
  ends_at: null as Date | null,
  all_day: false,
  is_submitting: false,
});

const ReducerRecord = ImmutableRecord({
  items: ImmutableList<Announcement>(),
  isLoading: false,
  page: -1,
  form: AnnouncementFormRecord(),
});

export default function adminAnnouncementsReducer(state = ReducerRecord(), action: AnyAction) {
  switch (action.type) {
    case ADMIN_ANNOUNCEMENTS_FETCH_REQUEST:
      return state.set('isLoading', true);
    case ADMIN_ANNOUNCEMENTS_FETCH_SUCCESS:
      return state.withMutations(map => {
        const items = ImmutableList<Announcement>((action.announcements).map((announcement: APIEntity) => normalizeAnnouncement(announcement)));

        map.set('items', items);
        map.set('isLoading', false);
      });
    case ADMIN_ANNOUNCEMENTS_FETCH_FAIL:
      return state.set('isLoading', false);
    case ADMIN_ANNOUNCEMENT_DELETE_SUCCESS:
      return state.update('items', list => {
        const idx = list.findIndex(x => x.id === action.id);

        if (idx > -1) {
          return list.delete(idx);
        }

        return list;
      });
    case ADMIN_ANNOUNCEMENT_CHANGE_CONTENT:
      return state.setIn(['form', 'content'], action.value);
    case ADMIN_ANNOUNCEMENT_CHANGE_START_TIME:
      return state.setIn(['form', 'starts_at'], action.value);
    case ADMIN_ANNOUNCEMENT_CHANGE_END_TIME:
      return state.setIn(['form', 'ends_at'], action.value);
    case ADMIN_ANNOUNCEMENT_CHANGE_ALL_DAY:
      return state.setIn(['form', 'all_day'], action.value);
    case ADMIN_ANNOUNCEMENT_CREATE_REQUEST:
      return state.setIn(['form', 'is_submitting'], true);
    case ADMIN_ANNOUNCEMENT_CREATE_SUCCESS:
    case ADMIN_ANNOUNCEMENT_CREATE_FAIL:
      return state.setIn(['form', 'is_submitting'], true);
    case ADMIN_ANNOUNCEMENT_MODAL_INIT:
      return state.set('form', action.announcement ? AnnouncementFormRecord({
        id: action.announcement.id,
        content: action.announcement.content,
        starts_at: action.announcement.starts_at ? new Date(action.announcement.starts_at) : null,
        ends_at: action.announcement.ends_at ? new Date(action.announcement.ends_at) : null,
        all_day: action.announcement.all_day,
      }) : AnnouncementFormRecord());
    default:
      return state;
  }
}
