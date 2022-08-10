import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { useApi } from 'soapbox/hooks';

export interface IChat {
  id: string
  unread: number
  created_by_account: number
  last_message: null | string
  created_at: Date
  updated_at: Date
  accepted: boolean
  discarded_at: null | string
  account: any
}

export interface IChatMessage {
  account_id: string
  chat_id: string
  content: string
  created_at: Date
  id: string
  unread: boolean
}

const reverseOrder = (a: IChat, b: IChat): number => {
  if (Number(a.id) < Number(b.id)) return -1;
  if (Number(a.id) > Number(b.id)) return 1;
  return 0;
};

const useChatMessages = (chatId: string) => {
  const api = useApi();

  const getChatMessages = async (chatId: string, pageParam?: any): Promise<{ result: IChatMessage[], maxId: string, hasMore: boolean }> => {
    const { data, headers } = await api.get(`/api/v1/pleroma/chats/${chatId}/messages`, {
      params: {
        max_id: pageParam?.maxId,
      },
    });

    const hasMore = !!headers.link;
    const result = data.sort(reverseOrder);
    const nextMaxId = result[0]?.id;

    return {
      result,
      maxId: nextMaxId,
      hasMore,
    };
  };

  const queryInfo = useInfiniteQuery(['chats', 'messages', chatId], ({ pageParam }) => getChatMessages(chatId, pageParam), {
    keepPreviousData: true,
    getNextPageParam: (config) => {
      if (config.hasMore) {
        return { maxId: config.maxId };
      }

      return undefined;
    },
  });

  const data = queryInfo.data?.pages.reduce<IChatMessage[]>(
    (prev: IChatMessage[], curr) => [...curr.result, ...prev],
    [],
  );

  return {
    ...queryInfo,
    data,
  };
};
const useChats = () => {
  const api = useApi();

  const getChats = async () => {
    const { data } = await api.get('/api/v1/pleroma/chats');
    return data;
  };

  const chatsQuery = useQuery<IChat[]>(['chats'], getChats, {
    placeholderData: [],
  });

  const getOrCreateChatByAccountId = (accountId: string) => api.post<IChat>(`/api/v1/pleroma/chats/by-account-id/${accountId}`);

  return { chatsQuery, getOrCreateChatByAccountId };
};

const useChat = (chatId: string) => {
  const api = useApi();

  const markChatAsRead = () => api.post<IChat>(`/api/v1/pleroma/chats/${chatId}/read`);

  const createChatMessage = (chatId: string, content: string) => {
    return api.post<IChat>(`/api/v1/pleroma/chats/${chatId}/messages`, { content });
  };

  return { createChatMessage, markChatAsRead };
};

export { useChat, useChats, useChatMessages };
