import {
  CHATS_FETCH_SUCCESS,
  CHATS_EXPAND_SUCCESS,
  CHAT_MESSAGES_FETCH_SUCCESS,
  CHAT_MESSAGE_SEND_REQUEST,
  CHAT_MESSAGE_SEND_SUCCESS,
  CHAT_MESSAGE_DELETE_SUCCESS,
} from '@/actions/chats.ts';
import { STREAMING_CHAT_UPDATE } from '@/actions/streaming.ts';

import type { APIEntity } from '@/types/entities.ts';
import type { AnyAction } from 'redux';

type APIEntities = Array<APIEntity>;

type State = Record<string, string[]>;

const initialState: State = {};

const idComparator = (a: string, b: string) => {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
};

const updateList = (state: State, chatId: string, messageIds: string[]): State => {
  const ids = state[chatId] || [];
  const newIds = [...new Set([...ids, ...messageIds])].sort(idComparator);
  return { ...state, [chatId]: newIds };
};

const importMessages = (state: State, chatMessages: APIEntities): State => (
  chatMessages.reduce((state, chatMessage) => updateList(state, chatMessage.chat_id, [chatMessage.id]), state)
);

const importLastMessages = (state: State, chats: APIEntities): State =>
  importMessages(state, chats.filter(chat => chat.last_message).map(chat => chat.last_message));

const replaceMessage = (state: State, chatId: string, oldId: string, newId: string): State => {
  const ids = (state[chatId] || []).filter(id => id !== oldId);
  return { ...state, [chatId]: [...new Set([...ids, newId])].sort(idComparator) };
};

const removeMessage = (state: State, chatId: string, messageId: string): State => {
  return { ...state, [chatId]: (state[chatId] || []).filter(id => id !== messageId) };
};

export default function chatMessageLists(state = initialState, action: AnyAction): State {
  switch (action.type) {
    case CHAT_MESSAGE_SEND_REQUEST:
      return updateList(state, action.chatId, [action.uuid]);
    case CHATS_FETCH_SUCCESS:
    case CHATS_EXPAND_SUCCESS:
      return importLastMessages(state, action.chats);
    case STREAMING_CHAT_UPDATE:
      if (action.chat.last_message &&
        action.chat.last_message.account_id !== action.me)
        return importMessages(state, [action.chat.last_message]);
      else
        return state;
    case CHAT_MESSAGES_FETCH_SUCCESS:
      return updateList(state, action.chatId, action.chatMessages.map((chat: APIEntity) => chat.id));
    case CHAT_MESSAGE_SEND_SUCCESS:
      return replaceMessage(state, action.chatId, action.uuid, action.chatMessage.id);
    case CHAT_MESSAGE_DELETE_SUCCESS:
      return removeMessage(state, action.chatId, action.messageId);
    default:
      return state;
  }
}
