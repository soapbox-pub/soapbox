import { MODAL_OPEN, MODAL_CLOSE } from '../actions/modals.ts';

import type { AnyAction } from 'redux';

export interface Modal {
  modalType: string;
  modalProps: Record<string, any> | null;
}

type State = Modal[];

export default function modal(state: State = [], action: AnyAction): State {
  switch (action.type) {
    case MODAL_OPEN:
      return [...state, { modalType: action.modalType ?? '', modalProps: action.modalProps ?? null }];
    case MODAL_CLOSE:
      if (state.length === 0) {
        return state;
      }
      if (action.modalType === undefined) {
        return state.slice(0, -1);
      }
      if (state.some(({ modalType }) => action.modalType === modalType)) {
        return state.slice(0, state.findLastIndex(({ modalType }) => action.modalType === modalType));
      }
      return state;
    default:
      return state;
  }
}
