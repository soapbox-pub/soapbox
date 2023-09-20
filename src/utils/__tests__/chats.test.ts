import { buildAccount } from 'soapbox/jest/factory';
import { normalizeChatMessage } from 'soapbox/normalizers';
import { ChatKeys, IChat } from 'soapbox/queries/chats';
import { queryClient } from 'soapbox/queries/client';

import { updateChatMessage } from '../chats';

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

describe('chat utils', () => {
  describe('updateChatMessage()', () => {
    const initialChatMessage = buildChatMessage('1');

    beforeEach(() => {
      const initialQueryData = {
        pages: [
          { result: [initialChatMessage], hasMore: false, link: undefined },
        ],
        pageParams: [undefined],
      };

      queryClient.setQueryData(ChatKeys.chatMessages(chat.id), initialQueryData);
    });

    it('correctly updates the chat message', () => {
      expect(
        (queryClient.getQueryData(ChatKeys.chatMessages(chat.id)) as any).pages[0].result[0].content,
      ).toEqual(initialChatMessage.content);

      const nextChatMessage = normalizeChatMessage({
        ...initialChatMessage.toJS(),
        content: 'new content',
      });

      updateChatMessage(nextChatMessage);
      expect(
        (queryClient.getQueryData(ChatKeys.chatMessages(chat.id)) as any).pages[0].result[0].content,
      ).toEqual(nextChatMessage.content);
    });
  });
});