import {
  CHATS_FETCH_SUCCESS,
  CHATS_FETCH_REQUEST,
  CHATS_EXPAND_SUCCESS,
  CHATS_EXPAND_REQUEST,
  CHAT_FETCH_SUCCESS,
  CHAT_READ_SUCCESS,
  CHAT_READ_REQUEST,
} from '@/actions/chats.ts';
import { STREAMING_CHAT_UPDATE } from '@/actions/streaming.ts';
import { normalizeChat } from '@/normalizers/index.ts';
import { normalizeId } from '@/utils/normalizers.ts';

import type { APIEntity } from '@/types/entities.ts';
import type { AnyAction } from 'redux';

type ChatRecord = ReturnType<typeof normalizeChat>;
type APIEntities = Array<APIEntity>;

export interface ReducerChat extends ChatRecord {
  last_message: string | null;
}

interface State {
  next: string | null;
  isLoading: boolean;
  items: Record<string, ReducerChat>;
}

const initialState: State = {
  next: null,
  isLoading: false,
  items: {},
};

const fixChat = (data: APIEntity): ReducerChat => {
  const chat = normalizeChat(data);
  return {
    ...chat,
    last_message: normalizeId(data.last_message?.id) || (typeof data.last_message === 'string' ? data.last_message : null),
  };
};

const importChats = (state: State, chats: APIEntities, next?: string): State => {
  const items = { ...state.items };

  chats.forEach(chat => {
    items[chat.id] = fixChat(chat);
  });

  return {
    ...state,
    next: next !== undefined ? next : state.next,
    items,
    isLoading: false,
  };
};

export default function chats(state: State = initialState, action: AnyAction): State {
  switch (action.type) {
    case CHATS_FETCH_REQUEST:
    case CHATS_EXPAND_REQUEST:
      return { ...state, isLoading: true };
    case CHATS_FETCH_SUCCESS:
    case CHATS_EXPAND_SUCCESS:
      return importChats(state, action.chats, action.next);
    case STREAMING_CHAT_UPDATE:
      return importChats(state, [action.chat]);
    case CHAT_FETCH_SUCCESS:
      return importChats(state, [action.chat]);
    case CHAT_READ_REQUEST:
      return state.items[action.chatId]
        ? { ...state, items: { ...state.items, [action.chatId]: { ...state.items[action.chatId], unread: 0 } } }
        : state;
    case CHAT_READ_SUCCESS:
      return importChats(state, [action.chat]);
    default:
      return state;
  }
}
