import {
  DOMAIN_BLOCKS_FETCH_SUCCESS,
  DOMAIN_BLOCKS_EXPAND_SUCCESS,
  DOMAIN_UNBLOCK_SUCCESS,
} from '../actions/domain-blocks.ts';

import type { AnyAction } from 'redux';

interface State {
  blocks: {
    items: string[];
    next: string | null;
  };
}

const initialState: State = {
  blocks: {
    items: [],
    next: null,
  },
};

export default function domainLists(state: State = initialState, action: AnyAction): State {
  switch (action.type) {
    case DOMAIN_BLOCKS_FETCH_SUCCESS:
      return { ...state, blocks: { items: [...new Set<string>(action.domains)], next: action.next } };
    case DOMAIN_BLOCKS_EXPAND_SUCCESS:
      return { ...state, blocks: { items: [...new Set([...state.blocks.items, ...action.domains])], next: action.next } };
    case DOMAIN_UNBLOCK_SUCCESS:
      return { ...state, blocks: { ...state.blocks, items: state.blocks.items.filter(domain => domain !== action.domain) } };
    default:
      return state;
  }
}
