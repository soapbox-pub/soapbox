import { InfiniteData, useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import sumBy from 'lodash/sumBy';

import { importFetchedAccount, importFetchedAccounts } from 'soapbox/actions/importer';
import snackbar from 'soapbox/actions/snackbar';
import { getNextLink } from 'soapbox/api';
import compareId from 'soapbox/compare_id';
import { ChatWidgetScreens, useChatContext } from 'soapbox/contexts/chat-context';
import { useStatContext } from 'soapbox/contexts/stat-context';
import { useApi, useAppDispatch, useAppSelector, useFeatures, useOwnAccount } from 'soapbox/hooks';
import { normalizeChatMessage } from 'soapbox/normalizers';
import { flattenPages, PaginatedResult, updatePageItem } from 'soapbox/utils/queries';

import { queryClient } from './client';
import { useFetchRelationships } from './relationships';

import type { IAccount } from './accounts';

export const messageExpirationOptions = [120, 604800, 1209600, 2592000, 7776000];

export enum MessageExpirationValues {
  'TWO_MINUTES' = messageExpirationOptions[0],
  'SEVEN' = messageExpirationOptions[1],
  'FOURTEEN' = messageExpirationOptions[2],
  'THIRTY' = messageExpirationOptions[3],
  'NINETY' = messageExpirationOptions[4]
}

export interface IChat {
  accepted: boolean
  account: IAccount
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
  latest_read_message_by_account: {
    id: string,
    date: string
  }[]
  latest_read_message_created_at: null | string
  message_expiration?: MessageExpirationValues
  unread: number
}

export interface IChatMessage {
  account_id: string
  chat_id: string
  content: string
  created_at: string
  id: string
  unread: boolean
  pending?: boolean
}

type UpdateChatVariables = {
  message_expiration: MessageExpirationValues
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

const reverseOrder = (a: IChat, b: IChat): number => compareId(a.id, b.id);

const useChatMessages = (chat: IChat) => {
  const api = useApi();
  const isBlocked = useAppSelector((state) => state.getIn(['relationships', chat.account.id, 'blocked_by']));

  const getChatMessages = async (chatId: string, pageParam?: any): Promise<PaginatedResult<IChatMessage>> => {
    const nextPageLink = pageParam?.link;
    const uri = nextPageLink || `/api/v1/pleroma/chats/${chatId}/messages`;
    const response = await api.get(uri);
    const { data } = response;

    const link = getNextLink(response);
    const hasMore = !!link;
    const result = data.sort(reverseOrder).map(normalizeChatMessage);

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

  const data = flattenPages(queryInfo.data);

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
      params: {
        search,
      },
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
  const account = useOwnAccount();
  const api = useApi();
  const dispatch = useAppDispatch();

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
    (
      {  chatId, content }: { chatId: string, content: string },
    ) => api.post<IChat>(`/api/v1/pleroma/chats/${chatId}/messages`, { content }),
    {
      retry: false,
      onMutate: async (variables) => {
        // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
        await queryClient.cancelQueries(['chats', 'messages', variables.chatId]);

        // Snapshot the previous value
        const prevContent = variables.content;
        const prevChatMessages = queryClient.getQueryData(['chats', 'messages', variables.chatId]);

        // Optimistically update to the new value
        queryClient.setQueryData(ChatKeys.chatMessages(variables.chatId), (prevResult: any) => {
          const newResult = { ...prevResult };
          newResult.pages = newResult.pages.map((page: any, idx: number) => {
            if (idx === 0) {
              return {
                ...page,
                result: [
                  ...page.result,
                  normalizeChatMessage({
                    content: variables.content,
                    id: String(Number(new Date())),
                    created_at: new Date(),
                    account_id: account?.id,
                    pending: true,
                    unread: true,
                  }),
                ],
              };
            }

            return page;
          });

          return newResult;
        });

        return { prevChatMessages, prevContent };
      },
      // If the mutation fails, use the context returned from onMutate to roll back
      onError: (_error: any, variables, context: any) => {
        queryClient.setQueryData(['chats', 'messages', variables.chatId], context.prevChatMessages);
      },
      onSuccess: (_data: any, variables) => {
        queryClient.invalidateQueries(ChatKeys.chatMessages(variables.chatId));
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
      dispatch(snackbar.error('Chat Settings failed to update.'));
    },
    onSuccess() {
      queryClient.invalidateQueries(ChatKeys.chat(chatId));
      queryClient.invalidateQueries(ChatKeys.chatSearch());
      dispatch(snackbar.success('Chat Settings updated successfully'));
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

  return { createChatMessage, markChatAsRead, deleteChatMessage, updateChat, acceptChat, deleteChat };
};

export { ChatKeys, useChat, useChatActions, useChats, useChatMessages, isLastMessage };
