import { InfiniteData, useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import sumBy from 'lodash/sumBy';

import { importFetchedAccount, importFetchedAccounts } from 'soapbox/actions/importer';
import { getNextLink } from 'soapbox/api';
import { ChatWidgetScreens, useChatContext } from 'soapbox/contexts/chat-context';
import { useStatContext } from 'soapbox/contexts/stat-context';
import { useApi, useAppDispatch, useAppSelector, useFeatures, useOwnAccount } from 'soapbox/hooks';
import { normalizeChatMessage } from 'soapbox/normalizers';
import toast from 'soapbox/toast';
import { ChatMessage } from 'soapbox/types/entities';
import { reOrderChatListItems, updateChatMessage } from 'soapbox/utils/chats';
import { flattenPages, PaginatedResult, updatePageItem } from 'soapbox/utils/queries';

import { queryClient } from './client';
import { useFetchRelationships } from './relationships';

import type { Account } from 'soapbox/schemas';

export const messageExpirationOptions = [604800, 1209600, 2592000, 7776000];

export enum MessageExpirationValues {
  'SEVEN' = messageExpirationOptions[0],
  'FOURTEEN' = messageExpirationOptions[1],
  'THIRTY' = messageExpirationOptions[2],
  'NINETY' = messageExpirationOptions[3]
}

export interface IChat {
  accepted: boolean
  account: Account
  chat_type: 'channel' | 'direct'
  created_at: string
  created_by_account: string
  discarded_at: null | string
  id: string
  last_message: null | {
    account_id: string
    chat_id: string
    content: string
    created_at: string
    discarded_at: string | null
    id: string
    unread: boolean
  }
  latest_read_message_by_account?: {
    id: string
    date: string
  }[]
  latest_read_message_created_at: null | string
  message_expiration?: MessageExpirationValues
  unread: number
}

type UpdateChatVariables = {
  message_expiration: MessageExpirationValues
}

type CreateReactionVariables = {
  messageId: string
  emoji: string
  chatMessage?: ChatMessage
}

const ChatKeys = {
  chat: (chatId?: string) => ['chats', 'chat', chatId] as const,
  chatMessages: (chatId: string) => ['chats', 'messages', chatId] as const,
  chatSearch: (searchQuery?: string) => searchQuery ? ['chats', 'search', searchQuery] : ['chats', 'search'] as const,
};

/** Check if item is most recent */
const isLastMessage = (chatMessageId: string): boolean => {
  const queryData = queryClient.getQueryData<InfiniteData<PaginatedResult<IChat>>>(ChatKeys.chatSearch());
  const items = flattenPages<IChat>(queryData);
  const chat = items?.find((item) => item.last_message?.id === chatMessageId);

  return !!chat;
};

const useChatMessages = (chat: IChat) => {
  const api = useApi();
  const isBlocked = useAppSelector((state) => state.getIn(['relationships', chat.account.id, 'blocked_by']));

  const getChatMessages = async (chatId: string, pageParam?: any): Promise<PaginatedResult<ChatMessage>> => {
    const nextPageLink = pageParam?.link;
    const uri = nextPageLink || `/api/v1/pleroma/chats/${chatId}/messages`;
    const response = await api.get<any[]>(uri);
    const { data } = response;

    const link = getNextLink(response);
    const hasMore = !!link;
    const result = data.map(normalizeChatMessage);

    return {
      result,
      link,
      hasMore,
    };
  };

  const queryInfo = useInfiniteQuery(ChatKeys.chatMessages(chat.id), ({ pageParam }) => getChatMessages(chat.id, pageParam), {
    enabled: !isBlocked,
    cacheTime: 0,
    staleTime: 0,
    getNextPageParam: (config) => {
      if (config.hasMore) {
        return { link: config.link };
      }

      return undefined;
    },
  });

  const data = flattenPages(queryInfo.data)?.reverse();

  return {
    ...queryInfo,
    data,
  };
};

const useChats = (search?: string) => {
  const api = useApi();
  const dispatch = useAppDispatch();
  const features = useFeatures();
  const { setUnreadChatsCount } = useStatContext();
  const fetchRelationships = useFetchRelationships();

  const getChats = async (pageParam?: any): Promise<PaginatedResult<IChat>> => {
    const endpoint = features.chatsV2 ? '/api/v2/pleroma/chats' : '/api/v1/pleroma/chats';
    const nextPageLink = pageParam?.link;
    const uri = nextPageLink || endpoint;
    const response = await api.get<IChat[]>(uri, {
      params: search ? {
        search,
      } : undefined,
    });
    const { data } = response;

    const link = getNextLink(response);
    const hasMore = !!link;

    setUnreadChatsCount(Number(response.headers['x-unread-messages-count']) || sumBy(data, (chat) => chat.unread));

    // Set the relationships to these users in the redux store.
    fetchRelationships.mutate({ accountIds: data.map((item) => item.account.id) });
    dispatch(importFetchedAccounts(data.map((item) => item.account)));

    return {
      result: data,
      hasMore,
      link,
    };
  };

  const queryInfo = useInfiniteQuery(ChatKeys.chatSearch(search), ({ pageParam }) => getChats(pageParam), {
    keepPreviousData: true,
    enabled: features.chats,
    getNextPageParam: (config) => {
      if (config.hasMore) {
        return { link: config.link };
      }

      return undefined;
    },
  });

  const data = flattenPages(queryInfo.data);

  const chatsQuery = {
    ...queryInfo,
    data,
  };

  const getOrCreateChatByAccountId = (accountId: string) => api.post<IChat>(`/api/v1/pleroma/chats/by-account-id/${accountId}`);

  return { chatsQuery, getOrCreateChatByAccountId };
};

const useChat = (chatId?: string) => {
  const api = useApi();
  const dispatch = useAppDispatch();
  const fetchRelationships = useFetchRelationships();

  const getChat = async () => {
    if (chatId) {
      const { data } = await api.get<IChat>(`/api/v1/pleroma/chats/${chatId}`);

      fetchRelationships.mutate({ accountIds: [data.account.id] });
      dispatch(importFetchedAccount(data.account));

      return data;
    }
  };

  return useQuery<IChat | undefined>(ChatKeys.chat(chatId), getChat, {
    cacheTime: 0,
    enabled: !!chatId,
  });
};

const useChatActions = (chatId: string) => {
  const { account } = useOwnAccount();
  const api = useApi();
  // const dispatch = useAppDispatch();

  const { setUnreadChatsCount } = useStatContext();

  const { chat, changeScreen } = useChatContext();

  const markChatAsRead = async (lastReadId: string) => {
    return api.post<IChat>(`/api/v1/pleroma/chats/${chatId}/read`, { last_read_id: lastReadId })
      .then(({ data }) => {
        updatePageItem(ChatKeys.chatSearch(), data, (o, n) => o.id === n.id);
        const queryData = queryClient.getQueryData<InfiniteData<PaginatedResult<unknown>>>(ChatKeys.chatSearch());

        if (queryData) {
          const flattenedQueryData: any = flattenPages(queryData)?.map((chat: any) => {
            if (chat.id === data.id) {
              return data;
            } else {
              return chat;
            }
          });
          setUnreadChatsCount(sumBy(flattenedQueryData, (chat: IChat) => chat.unread));
        }

        return data;
      })
      .catch(() => null);
  };

  const createChatMessage = useMutation(
    ({ chatId, content, mediaIds }: { chatId: string, content: string, mediaIds?: string[] }) => {
      return api.post<ChatMessage>(`/api/v1/pleroma/chats/${chatId}/messages`, {
        content,
        media_id: (mediaIds && mediaIds.length === 1) ? mediaIds[0] : undefined, // Pleroma backwards-compat
        media_ids: mediaIds,
      });
    },
    {
      retry: false,
      onMutate: async (variables) => {
        // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
        await queryClient.cancelQueries(['chats', 'messages', variables.chatId]);

        // Snapshot the previous value
        const prevContent = variables.content;
        const prevChatMessages = queryClient.getQueryData(['chats', 'messages', variables.chatId]);
        const pendingId = String(Number(new Date()));

        // Optimistically update to the new value
        queryClient.setQueryData(ChatKeys.chatMessages(variables.chatId), (prevResult: any) => {
          const newResult = { ...prevResult };
          newResult.pages = newResult.pages.map((page: any, idx: number) => {
            if (idx === 0) {
              return {
                ...page,
                result: [
                  normalizeChatMessage({
                    content: variables.content,
                    id: pendingId,
                    created_at: new Date(),
                    account_id: account?.id,
                    pending: true,
                    unread: true,
                  }),
                  ...page.result,
                ],
              };
            }

            return page;
          });

          return newResult;
        });

        return { prevChatMessages, prevContent, pendingId };
      },
      // If the mutation fails, use the context returned from onMutate to roll back
      onError: (_error: any, variables, context: any) => {
        queryClient.setQueryData(['chats', 'messages', variables.chatId], context.prevChatMessages);
      },
      onSuccess: (response: any, variables, context) => {
        const nextChat = { ...chat, last_message: response.data };
        updatePageItem(ChatKeys.chatSearch(), nextChat, (o, n) => o.id === n.id);
        updatePageItem(
          ChatKeys.chatMessages(variables.chatId),
          normalizeChatMessage(response.data),
          (o) => o.id === context.pendingId,
        );
        reOrderChatListItems();
      },
    },
  );

  const updateChat = useMutation((data: UpdateChatVariables) => api.patch<IChat>(`/api/v1/pleroma/chats/${chatId}`, data), {
    onMutate: async (data) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries(ChatKeys.chat(chatId));

      // Snapshot the previous value
      const prevChat = { ...chat };
      const nextChat = { ...chat, ...data };

      // Optimistically update to the new value
      queryClient.setQueryData(ChatKeys.chat(chatId), nextChat);

      // Return a context object with the snapshotted value
      return { prevChat };
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (_error: any, _newData: any, context: any) => {
      changeScreen(ChatWidgetScreens.CHAT, context.prevChat.id);
      queryClient.setQueryData(ChatKeys.chat(chatId), context.prevChat);
      toast.error('Chat Settings failed to update.');
    },
    onSuccess() {
      queryClient.invalidateQueries(ChatKeys.chat(chatId));
      queryClient.invalidateQueries(ChatKeys.chatSearch());
      toast.success('Chat Settings updated successfully');
    },
  });

  const deleteChatMessage = (chatMessageId: string) => api.delete<IChat>(`/api/v1/pleroma/chats/${chatId}/messages/${chatMessageId}`);

  const acceptChat = useMutation(() => api.post<IChat>(`/api/v1/pleroma/chats/${chatId}/accept`), {
    onSuccess(response) {
      changeScreen(ChatWidgetScreens.CHAT, response.data.id);
      queryClient.invalidateQueries(ChatKeys.chat(chatId));
      queryClient.invalidateQueries(ChatKeys.chatMessages(chatId));
      queryClient.invalidateQueries(ChatKeys.chatSearch());
    },
  });

  const deleteChat = useMutation(() => api.delete<IChat>(`/api/v1/pleroma/chats/${chatId}`), {
    onSuccess() {
      changeScreen(ChatWidgetScreens.INBOX);
      queryClient.invalidateQueries(ChatKeys.chatMessages(chatId));
      queryClient.invalidateQueries(ChatKeys.chatSearch());
    },
  });

  const createReaction = useMutation((data: CreateReactionVariables) => api.post(`/api/v1/pleroma/chats/${chatId}/messages/${data.messageId}/reactions`, {
    emoji: data.emoji,
  }), {
    // TODO: add optimistic updates
    onSuccess(response) {
      updateChatMessage(response.data);
    },
  });

  const deleteReaction = useMutation(
    (data: CreateReactionVariables) => api.delete(`/api/v1/pleroma/chats/${chatId}/messages/${data.messageId}/reactions/${data.emoji}`),
    {
      onSuccess() {
        queryClient.invalidateQueries(ChatKeys.chatMessages(chatId));
      },
    },
  );

  return {
    acceptChat,
    createChatMessage,
    createReaction,
    deleteChat,
    deleteChatMessage,
    deleteReaction,
    markChatAsRead,
    updateChat,
  };
};

export { ChatKeys, useChat, useChatActions, useChats, useChatMessages, isLastMessage };
