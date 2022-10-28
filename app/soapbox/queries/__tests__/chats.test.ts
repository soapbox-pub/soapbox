import { Map as ImmutableMap } from 'immutable';
import sumBy from 'lodash/sumBy';
import { useEffect } from 'react';

import { __stub } from 'soapbox/api';
import { mockStore, queryClient, renderHook, rootState, waitFor } from 'soapbox/jest/test-helpers';
import { normalizeRelationship } from 'soapbox/normalizers';
import { flattenPages } from 'soapbox/utils/queries';

import { IAccount } from '../accounts';
import { ChatKeys, IChat, IChatMessage, useChat, useChatActions, useChatMessages, useChats } from '../chats';

jest.mock('soapbox/utils/queries');

const chat: IChat = {
  accepted: true,
  account: {
    username: 'username',
    verified: true,
    id: '1',
    acct: 'acct',
    avatar: 'avatar',
    avatar_static: 'avatar',
    display_name: 'my name',
  } as IAccount,
  created_at: '2020-06-10T02:05:06.000Z',
  created_by_account: '1',
  discarded_at: null,
  id: '1',
  last_message: null,
  latest_read_message_by_account: null,
  latest_read_message_created_at: null,
  message_expiration: 1209600,
  unread: 0,
};

const buildChatMessage = (id: string): IChatMessage => ({
  id,
  chat_id: '1',
  account_id: '1',
  content: `chat message #${id}`,
  created_at: '2020-06-10T02:05:06.000Z',
  unread: true,
});

describe('useChatMessages', () => {
  let store: ReturnType<typeof mockStore>;

  beforeEach(() => {
    queryClient.clear();
  });

  describe('when the user is blocked', () => {
    beforeEach(() => {
      const state = rootState
        .set(
          'relationships',
          ImmutableMap({ '1': normalizeRelationship({ blocked_by: true }) }),
        );
      store = mockStore(state);
    });

    it('is does not fetch the endpoint', async () => {
      const { result } = renderHook(() => useChatMessages(chat), undefined, store);

      await waitFor(() => expect(result.current.isFetching).toBe(false));

      expect(result.current.data?.length).toBeUndefined();
    });
  });

  describe('when the user is not blocked', () => {
    describe('with a successful request', () => {
      beforeEach(() => {
        __stub((mock) => {
          mock.onGet(`/api/v1/pleroma/chats/${chat.id}/messages`)
            .reply(200, [
              buildChatMessage('2'),
            ], {
              link: `<https://example.com/api/v1/pleroma/chats/${chat.id}/messages?since_id=2>; rel="prev"`,
            });
        });
      });

      it('is successful', async () => {
        const { result } = renderHook(() => useChatMessages(chat));

        await waitFor(() => expect(result.current.isFetching).toBe(false));

        expect(result.current.data?.length).toBe(1);
      });
    });

    describe('with an unsuccessful query', () => {
      beforeEach(() => {
        __stub((mock) => {
          mock.onGet(`/api/v1/pleroma/chats/${chat.id}/messages`).networkError();
        });
      });

      it('is has error state', async() => {
        const { result } = renderHook(() => useChatMessages(chat));

        await waitFor(() => expect(result.current.isFetching).toBe(false));

        expect(result.current.error).toBeDefined();
      });
    });
  });
});

describe('useChats', () => {
  let store: ReturnType<typeof mockStore>;

  beforeEach(() => {
    queryClient.clear();
  });

  describe('with a successful request', () => {
    beforeEach(() => {
      store = mockStore(ImmutableMap());

      __stub((mock) => {
        mock.onGet('/api/v1/pleroma/chats')
          .reply(200, [
            chat,
          ], {
            link: '<https://example.com/api/v1/pleroma/chats?since_id=2>; rel="prev"',
          });
      });
    });

    it('is successful', async () => {
      const { result } = renderHook(() => useChats().chatsQuery, undefined, store);

      await waitFor(() => expect(result.current.isFetching).toBe(false));

      expect(result.current.data?.length).toBe(1);
    });
  });

  describe('with an unsuccessful query', () => {
    beforeEach(() => {
      __stub((mock) => {
        mock.onGet('/api/v1/pleroma/chats').networkError();
      });
    });

    it('is has error state', async() => {
      const { result } = renderHook(() => useChats().chatsQuery);

      await waitFor(() => expect(result.current.isFetching).toBe(false));

      expect(result.current.error).toBeDefined();
    });
  });
});

describe('useChat()', () => {
  beforeEach(() => {
    queryClient.clear();
  });

  describe('with a successful request', () => {
    beforeEach(() => {
      __stub((mock) => {
        mock.onGet(`/api/v1/pleroma/chats/${chat.id}`).reply(200, chat);
      });
    });

    it('is successful', async () => {
      const { result } = renderHook(() => useChat(chat.id).chat);

      await waitFor(() => expect(result.current.isFetching).toBe(false));

      expect(result.current.data.id).toBe(chat.id);
    });
  });

  describe('with an unsuccessful query', () => {
    beforeEach(() => {
      __stub((mock) => {
        mock.onGet(`/api/v1/pleroma/chats/${chat.id}`).networkError();
      });
    });

    it('is has error state', async() => {
      const { result } = renderHook(() => useChat(chat.id).chat);

      await waitFor(() => expect(result.current.isFetching).toBe(false));

      expect(result.current.error).toBeDefined();
    });
  });
});

describe('useChatActions', () => {
  beforeEach(() => {
    queryClient.clear();
  });

  describe('markChatAsRead()', () => {
    const nextUnreadCount = 5;

    beforeEach(() => {
      __stub((mock) => {
        mock
          .onPost(`/api/v1/pleroma/chats/${chat.id}/read`, { last_read_id: '2' })
          .reply(200, { ...chat, unread: nextUnreadCount });
      });
    });

    it('updates the queryCache', async() => {
      const initialQueryData = {
        pages: [
          { result: [chat], hasMore: false, link: undefined },
        ],
        pageParams: [undefined],
      };
      const initialFlattenedData = flattenPages(initialQueryData);
      expect(sumBy(initialFlattenedData, (chat: IChat) => chat.unread)).toBe(0);

      queryClient.setQueryData(ChatKeys.chatSearch(), initialQueryData);

      const { result } = renderHook(() => useChatActions(chat.id).markChatAsRead('2'));

      await waitFor(() => {
        expect(result.current).resolves.toBeDefined();
      });

      const nextQueryData = queryClient.getQueryData(ChatKeys.chatSearch());
      const nextFlattenedData = flattenPages(nextQueryData as any);
      expect(sumBy(nextFlattenedData as any, (chat: IChat) => chat.unread)).toBe(nextUnreadCount);
    });
  });

  describe('updateChat()', () => {
    const nextUnreadCount = 5;

    beforeEach(() => {
      __stub((mock) => {
        mock
          .onPatch(`/api/v1/pleroma/chats/${chat.id}`)
          .reply(200, { ...chat, unread: nextUnreadCount });
      });
    });

    it('updates the queryCache for the chat', async() => {
      const initialQueryData = { ...chat };
      expect(initialQueryData.message_expiration).toBe(1209600);
      queryClient.setQueryData(ChatKeys.chat(chat.id), initialQueryData);

      const { result } = renderHook(() => {
        const { updateChat } = useChatActions(chat.id);

        useEffect(() => {
          updateChat.mutate({  message_expiration: 1200 });
        }, []);

        return updateChat;
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const nextQueryData = queryClient.getQueryData(ChatKeys.chat(chat.id));
      expect((nextQueryData as any).message_expiration).toBe(1200);
    });
  });
});