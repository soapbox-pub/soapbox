import { Record as ImmutableRecord } from 'immutable';

import {
  GROUP_EDITOR_RESET,
  GROUP_EDITOR_TITLE_CHANGE,
  GROUP_EDITOR_DESCRIPTION_CHANGE,
  GROUP_CREATE_REQUEST,
  GROUP_CREATE_FAIL,
  GROUP_CREATE_SUCCESS,
} from 'soapbox/actions/groups';

import type { AnyAction } from 'redux';

const ReducerRecord = ImmutableRecord({
  groupId: null as string | null,
  isUploading: false,
  isSubmitting: false,
  isChanged: false,
  displayName: '',
  note: '',
  avatar: null,
  header: null,
  locked: false,
});

type State = ReturnType<typeof ReducerRecord>;

export default function groupEditor(state: State = ReducerRecord(), action: AnyAction) {
  switch (action.type) {
    case GROUP_EDITOR_RESET:
      return ReducerRecord();
    case GROUP_EDITOR_TITLE_CHANGE:
      return state.withMutations(map => {
        map.set('displayName', action.value);
        map.set('isChanged', true);
      });
    case GROUP_EDITOR_DESCRIPTION_CHANGE:
      return state.withMutations(map => {
        map.set('note', action.value);
        map.set('isChanged', true);
      });
    case GROUP_CREATE_REQUEST:
      return state.withMutations(map => {
        map.set('isSubmitting', true);
        map.set('isChanged', false);
      });
    case GROUP_CREATE_FAIL:
      return state.set('isSubmitting', false);
    case GROUP_CREATE_SUCCESS:
      return state.withMutations(map => {
        map.set('isSubmitting', false);
        map.set('groupId', action.group.id);
      });
    default:
      return state;
  }
}
