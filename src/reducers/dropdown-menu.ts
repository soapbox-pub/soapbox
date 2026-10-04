import {
  DROPDOWN_MENU_OPEN,
  DROPDOWN_MENU_CLOSE,
} from '../actions/dropdown-menu.ts';

import type { AnyAction } from 'redux';

interface State {
  isOpen: boolean;
}

export default function dropdownMenu(state: State = { isOpen: false }, action: AnyAction): State {
  switch (action.type) {
    case DROPDOWN_MENU_OPEN:
      return { ...state, isOpen: true };
    case DROPDOWN_MENU_CLOSE:
      return { ...state, isOpen: false };
    default:
      return state;
  }
}
