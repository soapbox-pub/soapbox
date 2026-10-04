import {
  MUTES_INIT_MODAL,
  MUTES_TOGGLE_HIDE_NOTIFICATIONS,
  MUTES_CHANGE_DURATION,
} from '../actions/mutes.ts';

import type { AnyAction } from 'redux';

interface NewMute {
  isSubmitting: boolean;
  accountId: string | null;
  notifications: boolean;
  duration: number;
}

interface State {
  new: NewMute;
}

const initialState: State = {
  new: {
    isSubmitting: false,
    accountId: null,
    notifications: true,
    duration: 0,
  },
};

export default function mutes(state: State = initialState, action: AnyAction): State {
  switch (action.type) {
    case MUTES_INIT_MODAL:
      return {
        ...state,
        new: {
          ...state.new,
          isSubmitting: false,
          accountId: action.account.id,
          notifications: true,
        },
      };
    case MUTES_TOGGLE_HIDE_NOTIFICATIONS:
      return { ...state, new: { ...state.new, notifications: !state.new.notifications } };
    case MUTES_CHANGE_DURATION:
      return { ...state, new: { ...state.new, duration: action.duration } };
    default:
      return state;
  }
}
