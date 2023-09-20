import { Map as ImmutableMap } from 'immutable';
import sumBy from 'lodash/sumBy';
import { useEffect } from 'react';

import { __stub } from 'soapbox/api';
import { buildAccount, buildRelationship } from 'soapbox/jest/factory';
import { createTestStore, mockStore, queryClient, renderHook, rootState, waitFor } from 'soapbox/jest/test-helpers';
import { normalizeChatMessage } from 'soapbox/normalizers';
import { Store } from 'soapbox/store';
import { ChatMessage } from 'soapbox/types/entities';
import { flattenPages } from 'soapbox/utils/queries';

import { ChatKeys, IChat, isLastMessage, useChat, useChatActions, useChatMessages, useChats } from '../chats';

const chat: IChat = {
  accepted: true,
  account: buildAccount({
    username: 'username',
    verified: true,
    id: '1',
    acct: 'acct',
    avatar: 'avatar',
    avatar_static: 'avatar',
    display_name: 'my name',
  }),
  chat_type: 'direct',
  created_at: '2020-06-10T02:05:06.000Z',
  created_by_account: '1',
  discarded_at: null,
  id: '1',
  last_message: null,
  latest_read_message_by_account: [],
  latest_read_message_created_at: null,
  message_expiration: 1209600,
  unread: 0,
};

const buildChatMessage = (id: string) => normalizeChatMessage({
  id,
  chat_id: '1',
  account_id: '1',
  content: `chat message #${id}`,
  created_at: '2020-06-10T02:05:06.000Z',
  emoji_reactions: null,
  expiration: 1209600,
  unread: true,
});

describe('ChatKeys', () => {
  it('has a "chat" key', () => {
    const id = '1';

    expect(ChatKeys.chat(id)).toEqual(['chats', 'chat', id]);
  });

  it('has a "chatMessages" key', () => {
    const id = '1';

    expect(ChatKeys.chatMessages(id)).toEqual(['chats', 'messages', id]);
  });

  it('has a "chatSearch" key', () => {
    const searchQuery = 'che';

    expect(ChatKeys.chatSearch()).toEqual(['chats', 'search']);
    expect(ChatKeys.chatSearch(searchQuery)).toEqual(['chats', 'search', searchQuery]);
  });
});

describe('isLastMessage', () => {
  describe('when its the last message', () => {
    it('is truthy', () => {
      const id = '5';
      const newChat = { ...chat, last_message: { id } } as any;
      const initialQueryData = {
        pages: [
          { result: [newChat], hasMore: false, link: undefined },
        ],
        pageParams: [undefined],
      };
      const initialFlattenedData = flattenPages(initialQueryData);
      expect(sumBy(initialFlattenedData, (chat: IChat) => chat.unread)).toBe(0);

      queryClient.setQueryData(ChatKeys.chatSearch(), initialQueryData);

      expect(isLastMessage(id)).toBeTruthy();
    });
  });

  describe('when its not the last message', () => {
    it('is not truthy', () => {
      const id = '5';
      const newChat = { ...chat, last_message: { id } } as any;
      const initialQueryData = {
        pages: [
          { result: [newChat], hasMore: false, link: undefined },
        ],
        pageParams: [undefined],
      };
      const initialFlattenedData = flattenPages(initialQueryData);
      expect(sumBy(initialFlattenedData, (chat: IChat) => chat.unread)).toBe(0);

      queryClient.setQueryData(ChatKeys.chatSearch(), initialQueryData);

      expect(isLastMessage('10')).not.toBeTruthy();
    });
  });
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
          ImmutableMap({ '1': buildRelationship({ blocked_by: true }) }),
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
  // let store: ReturnType<typeof mockStore>;

  beforeEach(() => {
    queryClient.clear();
  });

  // describe('with a successful request', () => {
  //   beforeEach(() => {
  //     const state = rootState.setIn(['instance', 'version'], '2.7.2 (compatible; Pleroma 2.2.0)');
  //     store = mockStore(state);

  //     __stub((mock) => {
  //       mock.onGet('/api/v1/pleroma/chats')
  //         .reply(200, [
  //           chat,
  //         ], {
  //           link: '<https://example.com/api/v1/pleroma/chats?since_id=2>; rel="prev"',
  //         });
  //     });
  //   });

  //   it('is successful', async () => {
  //     const { result } = renderHook(() => useChats().chatsQuery, undefined, store);

  //     await waitFor(() => expect(result.current.isFetching).toBe(false));

  //     expect(result.current.data?.length).toBe(1);
  //   });
  // });

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
  const relationshipId = '123';
  let store: Store;

  beforeEach(() => {
    const state = rootState;
    store = createTestStore(state);

    queryClient.clear();
  });

  describe('with a successful request', () => {
    beforeEach(() => {
      __stub((mock) => {
        mock.onGet(`/api/v1/pleroma/chats/${chat.id}`).reply(200, chat);
        mock
          .onGet(`/api/v1/accounts/relationships?id[]=${chat.account.id}`)
          .reply(200, [buildRelationship({ id: relationshipId, blocked_by: true })]);
      });
    });

    it('is successful', async () => {
      expect(store.getState().relationships.getIn([relationshipId, 'blocked_by'])).toBeUndefined();

      const { result } = renderHook(() => useChat(chat.id), undefined, store);

      await waitFor(() => expect(result.current.isFetching).toBe(false));

      expect(store.getState().relationships.getIn([relationshipId, 'id'])).toBe(relationshipId);
      expect(store.getState().relationships.getIn([relationshipId, 'blocked_by'])).toBe(true);
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
      const { result } = renderHook(() => useChat(chat.id));

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

  describe('createChatMessage()', () => {
    beforeEach(() => {
      const initialQueryData = {
        pages: [
          { result: [buildChatMessage('1')], hasMore: false, link: undefined },
        ],
        pageParams: [undefined],
      };

      queryClient.setQueryData(ChatKeys.chatMessages(chat.id), initialQueryData);

      __stub((mock) => {
        mock
          .onPost(`/api/v1/pleroma/chats/${chat.id}/messages`)
          .reply(200, { hello: 'world' });
      });
    });

    it('creates a chat message', async() => {
      const { result } = renderHook(() => {
        const { createChatMessage } = useChatActions(chat.id);

        useEffect(() => {
          createChatMessage.mutate({ chatId: chat.id, content: 'hello' });
        }, []);

        return createChatMessage;
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data.data).toEqual({ hello: 'world' });
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
          updateChat.mutate({ message_expiration: 1200 });
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

  describe('createReaction()', () => {
    const chatMessage = buildChatMessage('1');

    beforeEach(() => {
      __stub((mock) => {
        mock
          .onPost(`/api/v1/pleroma/chats/${chat.id}/messages/${chatMessage.id}/reactions`)
          .reply(200, { ...chatMessage.toJS(), emoji_reactions: [{ name: '👍', count: 1, me: true }] });
      });
    });

    it('successfully updates the Chat Message record', async () => {
      const initialQueryData = {
        pages: [
          { result: [chatMessage], hasMore: false, link: undefined },
        ],
        pageParams: [undefined],
      };

      queryClient.setQueryData(ChatKeys.chatMessages(chat.id), initialQueryData);

      const { result } = renderHook(() => {
        const { createReaction } = useChatActions(chat.id);

        useEffect(() => {
          createReaction.mutate({
            messageId: chatMessage.id,
            emoji: '👍',
            chatMessage,
          });
        }, []);

        return createReaction;
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const updatedChatMessage = (queryClient.getQueryData(ChatKeys.chatMessages(chat.id)) as any).pages[0].result[0] as ChatMessage;
      expect(updatedChatMessage.emoji_reactions).toEqual([{
        name: '👍',
        count: 1,
        me: true,
      }]);
    });
  });
});
