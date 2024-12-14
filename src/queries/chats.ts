import { InfiniteData, keepPreviousData, useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';

import { importFetchedAccount, importFetchedAccounts } from 'soapbox/actions/importer/index.ts';
import { ChatWidgetScreens, useChatContext } from 'soapbox/contexts/chat-context.tsx';
import { useStatContext } from 'soapbox/contexts/stat-context.tsx';
import { useApi } from 'soapbox/hooks/useApi.ts';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';
import { useFeatures } from 'soapbox/hooks/useFeatures.ts';
import { useOwnAccount } from 'soapbox/hooks/useOwnAccount.ts';
import { normalizeChatMessage } from 'soapbox/normalizers/index.ts';
import toast from 'soapbox/toast.tsx';
import { ChatMessage } from 'soapbox/types/entities.ts';
import { reOrderChatListItems, updateChatMessage } from 'soapbox/utils/chats.ts';
import { flattenPages, PaginatedResult, updatePageItem } from 'soapbox/utils/queries.ts';

import { queryClient } from './client.ts';
import { useFetchRelationships } from './relationships.ts';

import type { Account } from 'soapbox/schemas/index.ts';

export const messageExpirationOptions = [604800, 1209600, 2592000, 7776000];

export enum MessageExpirationValues {
  'SEVEN' = messageExpirationOptions[0],
  'FOURTEEN' = messageExpirationOptions[1],
  'THIRTY' = messageExpirationOptions[2],
  'NINETY' = messageExpirationOptions[3]
}

export interface IChat {
  accepted: boolean;
  account: Account;
  chat_type: 'channel' | 'direct';
  created_at: string;
  created_by_account: string;
  discarded_at: null | string;
  id: string;
  last_message: null | {
    account_id: string;
    chat_id: string;
    content: string;
    created_at: string;
    discarded_at: string | null;
    id: string;
    unread: boolean;
  };
  latest_read_message_by_account?: {
    id: string;
    date: string;
  }[];
  latest_read_message_created_at: null | string;
  message_expiration?: MessageExpirationValues;
  unread: number;
}

type UpdateChatVariables = {
  message_expiration: MessageExpirationValues;
}

type CreateReactionVariables = {
  messageId: string;
  emoji: string;
  chatMessage?: ChatMessage;
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
  const isBlocked = useAppSelector((state) => state.relationships.getIn([chat.account.id, 'blocked_by']));

  const getChatMessages = async (chatId: string, pageParam?: any): Promise<PaginatedResult<ChatMessage>> => {
    const nextPageLink = pageParam?.link;
    const uri = nextPageLink || `/api/v1/pleroma/chats/${chatId}/messages`;
    const response = await api.get(uri);
    const data = await response.json();

    const next = response.next();
    const hasMore = !!next;
    const result = data.map(normalizeChatMessage);

    return {
      result,
      link: next ?? undefined,
      hasMore,
    };
  };

  const queryInfo = useInfiniteQuery({
    queryKey: ChatKeys.chatMessages(chat.id),
    queryFn: ({ pageParam }) => getChatMessages(chat.id, pageParam),
    enabled: !isBlocked,
    gcTime: 0,
    staleTime: 0,
    initialPageParam: { link: undefined as string | undefined },
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
    const response = await api.get(uri, {
      searchParams: search ? {
        search,
      } : undefined,
    });
    const data: IChat[] = await response.json();

    const next = response.next();
    const hasMore = !!next;

    setUnreadChatsCount(Number(response.headers.get('x-unread-messages-count')) || data.reduce((n, chat) => n + chat.unread, 0));

    // Set the relationships to these users in the redux store.
    fetchRelationships.mutate({ accountIds: data.map((item) => item.account.id) });
    dispatch(importFetchedAccounts(data.map((item) => item.account)));

    return {
      result: data,
      hasMore,
      link: next ?? undefined,
    };
  };

  const queryInfo = useInfiniteQuery({
    queryKey: ChatKeys.chatSearch(search),
    queryFn: ({ pageParam }) => getChats(pageParam),
    placeholderData: keepPreviousData,
    enabled: features.chats,
    initialPageParam: { link: undefined as string | undefined },
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

  const getOrCreateChatByAccountId = (accountId: string) => api.post(`/api/v1/pleroma/chats/by-account-id/${accountId}`);

  return { chatsQuery, getOrCreateChatByAccountId };
};

const useChat = (chatId?: string) => {
  const api = useApi();
  const dispatch = useAppDispatch();
  const fetchRelationships = useFetchRelationships();

  const getChat = async () => {
    if (chatId) {
      const response = await api.get(`/api/v1/pleroma/chats/${chatId}`);
      const data: IChat = await response.json();

      fetchRelationships.mutate({ accountIds: [data.account.id] });
      dispatch(importFetchedAccount(data.account));

      return data;
    }
  };

  return useQuery<IChat | undefined>({
    queryKey: ChatKeys.chat(chatId),
    queryFn: getChat,
    gcTime: 0,
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
    return api.post(`/api/v1/pleroma/chats/${chatId}/read`, { last_read_id: lastReadId })
      .then(async (response) => {
        const data = await response.json();
        updatePageItem(ChatKeys.chatSearch(), data, (o, n) => o.id === n.id);
        const queryData = queryClient.getQueryData<InfiniteData<PaginatedResult<IChat>>>(ChatKeys.chatSearch());

        if (queryData) {
          const flattenedQueryData = flattenPages<IChat>(queryData)?.map((chat: any) => {
            if (chat.id === data.id) {
              return data;
            } else {
              return chat;
            }
          });
          setUnreadChatsCount(flattenedQueryData?.reduce((n, chat) => n + chat.unread, 0));
        }

        return data;
      })
      .catch(() => null);
  };

  const createChatMessage = useMutation({
    mutationFn: async ({ chatId, content, mediaIds }: { chatId: string; content: string; mediaIds?: string[] }) => {
      const response = await api.post(`/api/v1/pleroma/chats/${chatId}/messages`, {
        content,
        media_id: (mediaIds && mediaIds.length === 1) ? mediaIds[0] : undefined, // Pleroma backwards-compat
        media_ids: mediaIds,
      });
      return response.json();
    },
    retry: false,
    onMutate: async (variables) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({
        queryKey: ['chats', 'messages', variables.chatId],
      });

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
    onSuccess: (data, variables, context) => {
      const nextChat = { ...chat, last_message: data };
      updatePageItem(ChatKeys.chatSearch(), nextChat, (o, n) => o.id === n.id);
      updatePageItem(
        ChatKeys.chatMessages(variables.chatId),
        normalizeChatMessage(data),
        (o) => o.id === context.pendingId,
      );
      reOrderChatListItems();
    },
  });

  const updateChat = useMutation({
    mutationFn: (data: UpdateChatVariables) => api.patch(`/api/v1/pleroma/chats/${chatId}`, data),
    onMutate: async (data) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({
        queryKey: ChatKeys.chat(chatId),
      });

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
      queryClient.invalidateQueries({ queryKey: ChatKeys.chat(chatId) });
      queryClient.invalidateQueries({ queryKey: ChatKeys.chatSearch() });
      toast.success('Chat Settings updated successfully');
    },
  });

  const deleteChatMessage = (chatMessageId: string) => api.delete(`/api/v1/pleroma/chats/${chatId}/messages/${chatMessageId}`);

  const acceptChat = useMutation({
    mutationFn: () => api.post(`/api/v1/pleroma/chats/${chatId}/accept`),
    async onSuccess(response) {
      const data = await response.json();
      changeScreen(ChatWidgetScreens.CHAT, data.id);
      queryClient.invalidateQueries({ queryKey: ChatKeys.chat(chatId) });
      queryClient.invalidateQueries({ queryKey: ChatKeys.chatMessages(chatId) });
      queryClient.invalidateQueries({ queryKey: ChatKeys.chatSearch() });
    },
  });

  const deleteChat = useMutation({
    mutationFn: () => api.delete(`/api/v1/pleroma/chats/${chatId}`),
    onSuccess() {
      changeScreen(ChatWidgetScreens.INBOX);
      queryClient.invalidateQueries({ queryKey: ChatKeys.chatMessages(chatId) });
      queryClient.invalidateQueries({ queryKey: ChatKeys.chatSearch() });
    },
  });

  const createReaction = useMutation({
    mutationFn: (data: CreateReactionVariables) => api.post(`/api/v1/pleroma/chats/${chatId}/messages/${data.messageId}/reactions`, {
      json: {
        emoji: data.emoji,
      },
    }),
    // TODO: add optimistic updates
    async onSuccess(response) {
      updateChatMessage(await response.json());
    },
  });

  const deleteReaction = useMutation({
    mutationFn: (data: CreateReactionVariables) => api.delete(`/api/v1/pleroma/chats/${chatId}/messages/${data.messageId}/reactions/${data.emoji}`),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ChatKeys.chatMessages(chatId) });
    },
  });

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
