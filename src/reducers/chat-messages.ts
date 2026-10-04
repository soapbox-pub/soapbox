import {
  CHATS_FETCH_SUCCESS,
  CHATS_EXPAND_SUCCESS,
  CHAT_MESSAGES_FETCH_SUCCESS,
  CHAT_MESSAGE_SEND_REQUEST,
  CHAT_MESSAGE_SEND_SUCCESS,
  CHAT_MESSAGE_DELETE_REQUEST,
  CHAT_MESSAGE_DELETE_SUCCESS,
} from '@/actions/chats.ts';
import { STREAMING_CHAT_UPDATE } from '@/actions/streaming.ts';
import { normalizeChatMessage } from '@/normalizers/index.ts';

import type { APIEntity } from '@/types/entities.ts';
import type { AnyAction } from 'redux';

type ChatMessageRecord = ReturnType<typeof normalizeChatMessage>;
type APIEntities = Array<APIEntity>;

type State = Record<string, ChatMessageRecord>;

const importMessages = (state: State, messages: APIEntities): State => {
  const result = { ...state };

  messages.forEach(message => {
    result[message.id] = normalizeChatMessage(message);
  });

  return result;
};

const importLastMessages = (state: State, chats: APIEntities): State =>
  importMessages(state, chats.filter(chat => chat.last_message).map(chat => chat.last_message));

const deleteMessage = (state: State, id: string): State => {
  const { [id]: _, ...rest } = state;
  return rest;
};

const initialState: State = {};

export default function chatMessages(state = initialState, action: AnyAction): State {
  switch (action.type) {
    case CHAT_MESSAGE_SEND_REQUEST:
      return importMessages(state, [{
        id: action.uuid, // Make fake message to get overridden later
        chat_id: action.chatId,
        account_id: action.me,
        content: action.params.content,
        created_at: (new Date()).toISOString(),
        pending: true,
      }]);
    case CHATS_FETCH_SUCCESS:
    case CHATS_EXPAND_SUCCESS:
      return importLastMessages(state, action.chats);
    case CHAT_MESSAGES_FETCH_SUCCESS:
      return importMessages(state, action.chatMessages);
    case CHAT_MESSAGE_SEND_SUCCESS:
      return deleteMessage(importMessages(state, [action.chatMessage]), action.uuid);
    case STREAMING_CHAT_UPDATE:
      return importLastMessages(state, [action.chat]);
    case CHAT_MESSAGE_DELETE_REQUEST:
      return state[action.messageId]
        ? { ...state, [action.messageId]: { ...state[action.messageId], pending: true, deleting: true } }
        : state;
    case CHAT_MESSAGE_DELETE_SUCCESS:
      return deleteMessage(state, action.messageId);
    default:
      return state;
  }
}
