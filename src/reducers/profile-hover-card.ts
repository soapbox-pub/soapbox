import {
  PROFILE_HOVER_CARD_OPEN,
  PROFILE_HOVER_CARD_CLOSE,
  PROFILE_HOVER_CARD_UPDATE,
} from '@/actions/profile-hover-card.ts';

import type { AnyAction } from 'redux';

interface State {
  ref: React.MutableRefObject<HTMLDivElement> | null;
  accountId: string;
  hovered: boolean;
}

const initialState: State = {
  ref: null,
  accountId: '',
  hovered: false,
};

export default function profileHoverCard(state: State = initialState, action: AnyAction): State {
  switch (action.type) {
    case PROFILE_HOVER_CARD_OPEN:
      return { ...state, ref: action.ref, accountId: action.accountId };
    case PROFILE_HOVER_CARD_UPDATE:
      return { ...state, hovered: true };
    case PROFILE_HOVER_CARD_CLOSE:
      if (state.hovered === true && !action.force)
        return state;
      else
        return initialState;
    default:
      return state;
  }
}
