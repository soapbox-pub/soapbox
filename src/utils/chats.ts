import { InfiniteData } from '@tanstack/react-query';
import sumBy from 'lodash/sumBy';

import { normalizeChatMessage } from 'soapbox/normalizers';
import { ChatKeys } from 'soapbox/queries/chats';
import { queryClient } from 'soapbox/queries/client';
import { Chat, ChatMessage } from 'soapbox/types/entities';

import { compareDate } from './comparators';
import { appendPageItem, flattenPages, PaginatedResult, sortQueryData, updatePageItem } from './queries';

interface ChatPayload extends Omit<Chat, 'last_message'> {
  last_message: ChatMessage | null
}

/**
 * Update the Chat entity inside the ChatSearch query.
 * @param newChat - Chat entity.
 */
const updateChatInChatSearchQuery = (newChat: ChatPayload) => {
  updatePageItem<ChatPayload>(ChatKeys.chatSearch(), newChat as any, (o, n) => o.id === n.id);
};

/**
 * Re-order the ChatSearch query by the last message timestamp.
 */
const reOrderChatListItems = () => {
  sortQueryData<ChatPayload>(ChatKeys.chatSearch(), (chatA, chatB) => {
    return compareDate(
      chatA.last_message?.created_at as string,
      chatB.last_message?.created_at as string,
    );
  });
};

/**
 * Check if a Chat entity exists within the cached ChatSearch query.
 * @param chatId - String
 * @returns Boolean
 */
const checkIfChatExists = (chatId: string) => {
  const currentChats = flattenPages(
    queryClient.getQueryData<InfiniteData<PaginatedResult<Chat>>>(ChatKeys.chatSearch()),
  );

  return currentChats?.find((chat: Chat) => chat.id === chatId);
};

/**
 * Force a re-fetch of ChatSearch.
 */
const invalidateChatSearchQuery = () => {
  queryClient.invalidateQueries(ChatKeys.chatSearch());
};

const updateChatListItem = (newChat: ChatPayload) => {
  const { id: chatId, last_message: lastMessage } = newChat;

  const isChatAlreadyLoaded = checkIfChatExists(chatId);

  if (isChatAlreadyLoaded) {
    // If the chat exists in the client, let's update it.
    updateChatInChatSearchQuery(newChat);
    // Now that we have the new chat loaded, let's re-sort to put
    // the most recent on top.
    reOrderChatListItems();
  } else {
    // If this is a brand-new chat, let's invalid the queries.
    invalidateChatSearchQuery();
  }

  if (lastMessage) {
    // Update the Chat Messages query data.
    appendPageItem(ChatKeys.chatMessages(newChat.id), normalizeChatMessage(lastMessage));
  }
};

/** Get unread chats count. */
const getUnreadChatsCount = (): number => {
  const chats = flattenPages(
    queryClient.getQueryData<InfiniteData<PaginatedResult<Chat>>>(ChatKeys.chatSearch()),
  );

  return sumBy(chats, chat => chat.unread);
};

/** Update the query cache for an individual Chat Message */
const updateChatMessage = (chatMessage: ChatMessage) => updatePageItem(
  ChatKeys.chatMessages(chatMessage.chat_id),
  normalizeChatMessage(chatMessage),
  (o, n) => o.id === n.id,
);

export { updateChatListItem, updateChatMessage, getUnreadChatsCount, reOrderChatListItems };