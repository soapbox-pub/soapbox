import {
  CONVERSATIONS_MOUNT,
  CONVERSATIONS_UNMOUNT,
  CONVERSATIONS_FETCH_REQUEST,
  CONVERSATIONS_FETCH_SUCCESS,
  CONVERSATIONS_FETCH_FAIL,
  CONVERSATIONS_UPDATE,
  CONVERSATIONS_READ,
} from '../actions/conversations.ts';
import { compareDate } from '../utils/comparators.ts';

import type { APIEntity } from '@/types/entities.ts';
import type { AnyAction } from 'redux';

interface Conversation {
  id: string;
  unread: boolean;
  accounts: string[];
  last_status: string | null;
  last_status_created_at: string | null;
}

interface State {
  items: Conversation[];
  isLoading: boolean;
  hasMore: boolean;
  mounted: number;
}

const initialState: State = {
  items: [],
  isLoading: false,
  hasMore: true,
  mounted: 0,
};

const conversationToMap = (item: APIEntity): Conversation => ({
  id: item.id ?? '',
  unread: item.unread ?? false,
  accounts: item.accounts.map((a: APIEntity) => a.id),
  last_status: item.last_status ? item.last_status.id : null,
  last_status_created_at: item.last_status ? item.last_status.created_at : null,
});

const updateConversation = (state: State, item: APIEntity): State => {
  const list = state.items;
  const index = list.findIndex(x => x.id === item.id);
  const newItem = conversationToMap(item);

  if (index === -1) {
    return { ...state, items: [newItem, ...list] };
  } else {
    return { ...state, items: list.map((x, i) => i === index ? newItem : x) };
  }
};

const expandNormalizedConversations = (state: State, conversations: APIEntity[], next: string | null, isLoadingRecent?: boolean): State => {
  let items = conversations.map(conversationToMap);
  let result = state;

  if (items.length > 0) {
    let list = state.items.map(oldItem => {
      const newItemIndex = items.findIndex(x => x.id === oldItem.id);

      if (newItemIndex === -1) {
        return oldItem;
      }

      const newItem = items[newItemIndex];
      items = items.filter((_, i) => i !== newItemIndex);

      return newItem;
    });

    list = list.concat(items);

    list = [...list].sort((x, y) => {
      const a = x.last_status_created_at;
      const b = y.last_status_created_at;

      if (a === null || b === null) {
        return -1;
      }

      return compareDate(a, b);
    });

    result = { ...result, items: list };
  }

  if (!next && !isLoadingRecent) {
    result = { ...result, hasMore: false };
  }

  return { ...result, isLoading: false };
};

export default function conversations(state: State = initialState, action: AnyAction): State {
  switch (action.type) {
    case CONVERSATIONS_FETCH_REQUEST:
      return { ...state, isLoading: true };
    case CONVERSATIONS_FETCH_FAIL:
      return { ...state, isLoading: false };
    case CONVERSATIONS_FETCH_SUCCESS:
      return expandNormalizedConversations(state, action.conversations, action.next, action.isLoadingRecent);
    case CONVERSATIONS_UPDATE:
      return updateConversation(state, action.conversation);
    case CONVERSATIONS_MOUNT:
      return { ...state, mounted: state.mounted + 1 };
    case CONVERSATIONS_UNMOUNT:
      return { ...state, mounted: state.mounted - 1 };
    case CONVERSATIONS_READ:
      return {
        ...state,
        items: state.items.map(item => {
          if (item.id === action.id) {
            return { ...item, unread: false };
          }

          return item;
        }),
      };
    default:
      return state;
  }
}
