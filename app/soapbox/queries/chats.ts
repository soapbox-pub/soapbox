import { InfiniteData, useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import sumBy from 'lodash/sumBy';

import { fetchRelationships } from 'soapbox/actions/accounts';
import { importFetchedAccount, importFetchedAccounts } from 'soapbox/actions/importer';
import snackbar from 'soapbox/actions/snackbar';
import { getNextLink } from 'soapbox/api';
import compareId from 'soapbox/compare_id';
import { useChatContext } from 'soapbox/contexts/chat-context';
import { useStatContext } from 'soapbox/contexts/stat-context';
import { useApi, useAppDispatch, useAppSelector, useFeatures } from 'soapbox/hooks';
import { flattenPages, PaginatedResult, updatePageItem } from 'soapbox/utils/queries';

import { queryClient } from './client';

import type { IAccount } from './accounts';

export const messageExpirationOptions = [604800, 1209600, 2592000, 7776000];

export enum MessageExpirationValues {
  'SEVEN' = messageExpirationOptions[0],
  'FOURTEEN' = messageExpirationOptions[1],
  'THIRTY' = messageExpirationOptions[2],
  'NINETY' = messageExpirationOptions[3]
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
  latest_read_message_by_account: null | {
    [id: number]: string
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
  const items = flattenPages(queryData);
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
    const result = data.sort(reverseOrder);

    return {
      result,
      link,
      hasMore,
    };
  };

  const queryInfo = useInfiniteQuery(ChatKeys.chatMessages(chat.id), ({ pageParam }) => getChatMessages(chat.id, pageParam), {
    enabled: !isBlocked,
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
    dispatch(fetchRelationships(data.map((item) => item.account.id)));
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
  const actions = useChatActions(chatId!);
  const dispatch = useAppDispatch();

  const getChat = async () => {
    if (chatId) {
      const { data } = await api.get<IChat>(`/api/v1/pleroma/chats/${chatId}`);

      dispatch(importFetchedAccount(data.account));

      return data;
    }
  };

  const chat = useQuery<IChat | undefined>(ChatKeys.chat(chatId), getChat);

  return { ...actions, chat };
};

const useChatActions = (chatId: string) => {
  const api = useApi();
  const dispatch = useAppDispatch();
  const { setUnreadChatsCount } = useStatContext();

  const { chat, setChat, setEditing } = useChatContext();

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

  const createChatMessage = (chatId: string, content: string) => {
    return api.post<IChat>(`/api/v1/pleroma/chats/${chatId}/messages`, { content });
  };

  const updateChat = useMutation((data: UpdateChatVariables) => api.patch<IChat>(`/api/v1/pleroma/chats/${chatId}`, data), {
    onMutate: async (data) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries(ChatKeys.chat(chatId));

      // Snapshot the previous value
      const prevChat = { ...chat };
      const nextChat = { ...chat, ...data };

      // Optimistically update to the new value
      queryClient.setQueryData(ChatKeys.chat(chatId), nextChat);
      setChat(nextChat as IChat);

      // Return a context object with the snapshotted value
      return { prevChat };
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (_error: any, _newData: any, context: any) => {
      setChat(context?.prevChat);
      queryClient.setQueryData(ChatKeys.chat(chatId), context.prevChat);
      dispatch(snackbar.error('Chat Settings failed to update.'));
    },
    onSuccess(response) {
      queryClient.invalidateQueries(ChatKeys.chat(chatId));
      queryClient.invalidateQueries(ChatKeys.chatSearch());
      setChat(response.data);
      dispatch(snackbar.success('Chat Settings updated successfully'));
    },
  });

  const deleteChatMessage = (chatMessageId: string) => api.delete<IChat>(`/api/v1/pleroma/chats/${chatId}/messages/${chatMessageId}`);

  const acceptChat = useMutation(() => api.post<IChat>(`/api/v1/pleroma/chats/${chatId}/accept`), {
    onSuccess(response) {
      setChat(response.data);
      queryClient.invalidateQueries(ChatKeys.chatMessages(chatId));
      queryClient.invalidateQueries(ChatKeys.chatSearch());
    },
  });

  const deleteChat = useMutation(() => api.delete<IChat>(`/api/v1/pleroma/chats/${chatId}`), {
    onSuccess(response) {
      setChat(null);
      setEditing(false);
      queryClient.invalidateQueries(ChatKeys.chatMessages(chatId));
      queryClient.invalidateQueries(ChatKeys.chatSearch());
    },
  });

  return { createChatMessage, markChatAsRead, deleteChatMessage, updateChat, acceptChat, deleteChat };
};

export { ChatKeys, useChat, useChatActions, useChats, useChatMessages, isLastMessage };
