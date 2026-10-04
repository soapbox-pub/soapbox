import {
  STATUS_HOVER_CARD_OPEN,
  STATUS_HOVER_CARD_CLOSE,
  STATUS_HOVER_CARD_UPDATE,
} from '@/actions/status-hover-card.ts';

import type { AnyAction } from 'redux';

interface State {
  ref: React.MutableRefObject<HTMLDivElement> | null;
  statusId: string;
  hovered: boolean;
}

export const initialState: State = {
  ref: null,
  statusId: '',
  hovered: false,
};

export default function statusHoverCard(state: State = initialState, action: AnyAction): State {
  switch (action.type) {
    case STATUS_HOVER_CARD_OPEN:
      return { ...state, ref: action.ref, statusId: action.statusId };
    case STATUS_HOVER_CARD_UPDATE:
      return { ...state, hovered: true };
    case STATUS_HOVER_CARD_CLOSE:
      if (state.hovered === true && !action.force)
        return state;
      else
        return initialState;
    default:
      return state;
  }
}
