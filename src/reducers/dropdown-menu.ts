import { Record as ImmutableRecord } from 'immutable';

import {
  DROPDOWN_MENU_OPEN,
  DROPDOWN_MENU_CLOSE,
} from '../actions/dropdown-menu';

import type { AnyAction } from 'redux';

const ReducerRecord = ImmutableRecord({
  isOpen: false,
});

type State = ReturnType<typeof ReducerRecord>;

export default function dropdownMenu(state: State = ReducerRecord(), action: AnyAction) {
  switch (action.type) {
    case DROPDOWN_MENU_OPEN:
      return state.set('isOpen', true);
    case DROPDOWN_MENU_CLOSE:
      return state.set('isOpen', false);
    default:
      return state;
  }
}
