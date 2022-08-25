import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import snackbar from 'soapbox/actions/snackbar';
import { useChatContext } from 'soapbox/contexts/chat-context';
import { useApi, useAppDispatch } from 'soapbox/hooks';

import { queryClient } from './client';

export interface IChat {
  id: string
  unread: number
  created_by_account: string
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

  const getChatMessages = async(chatId: string, pageParam?: any): Promise<{ result: IChatMessage[], maxId: string, hasMore: boolean }> => {
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

  const getChats = async() => {
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
  const { setChat, setEditing } = useChatContext();

  const markChatAsRead = () => api.post<IChat>(`/api/v1/pleroma/chats/${chatId}/read`);

  const createChatMessage = (chatId: string, content: string) => {
    return api.post<IChat>(`/api/v1/pleroma/chats/${chatId}/messages`, { content });
  };

  const deleteChatMessage = (chatMessageId: string) => api.delete<IChat>(`/api/v1/pleroma/chats/${chatId}/messages/${chatMessageId}`);

  const acceptChat = useMutation(() => api.post<IChat>(`/api/v1/pleroma/chats/${chatId}/accept`), {
    onSuccess(response) {
      setChat(response.data);
      queryClient.invalidateQueries(['chats', 'messages', chatId]);
      queryClient.invalidateQueries(['chats']);
    },
  });

  const deleteChat = useMutation(() => api.delete<IChat>(`/api/v1/pleroma/chats/${chatId}`), {
    onSuccess(response) {
      setChat(null);
      setEditing(false);
      queryClient.invalidateQueries(['chats', 'messages', chatId]);
      queryClient.invalidateQueries(['chats']);
    },
  });

  return { createChatMessage, markChatAsRead, deleteChatMessage, acceptChat, deleteChat };
};

const useChatSnoozes = () => {
  const api = useApi();
  const dispatch = useAppDispatch();

  const { chat } = useChatContext();
  const [isSnoozed, setSnoozed] = useState<boolean>(false);

  const getChatSnoozes = async() => {
    const { data } = await api.get(`api/v1/pleroma/chats/snooze?account_id=${chat?.account.id}`);
    return data;
  };

  const fetchChatSnooze = async() => {
    const data = await getChatSnoozes();
    if (data) {
      setSnoozed(true);
    }
  };

  const handleSnooze = () => {
    if (isSnoozed) {
      deleteSnooze();
    } else {
      createSnooze();
    }
  };

  const createSnooze = () => {
    setSnoozed(true);

    api.post(`api/v1/pleroma/chats/snooze?account_id=${chat?.account.id}`)
      .then(() => {
        dispatch(snackbar.success('Successfully snoozed this chat.'));
      })
      .catch(() => {
        dispatch(snackbar.error('Something went wrong trying to snooze this chat. Please try again.'));
        setSnoozed(false);
      });
  };

  const deleteSnooze = () => {
    setSnoozed(false);

    api.delete(`api/v1/pleroma/chats/snooze?account_id=${chat?.account.id}`)
      .then(() => {
        dispatch(snackbar.success('Successfully unsnoozed this chat.'));
      })
      .catch(() => {
        dispatch(snackbar.error('Something went wrong trying to unsnooze this chat. Please try again.'));
        setSnoozed(true);
      });
  };

  useEffect(() => {
    fetchChatSnooze();
  }, []);

  return { isSnoozed, handleSnooze };
};

export { useChat, useChats, useChatMessages, useChatSnoozes };
