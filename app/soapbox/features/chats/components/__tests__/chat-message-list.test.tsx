import userEvent from '@testing-library/user-event';
import React from 'react';
import { VirtuosoMockContext } from 'react-virtuoso';

import { ChatContext } from 'soapbox/contexts/chat-context';
import { normalizeInstance } from 'soapbox/normalizers';
import { IAccount } from 'soapbox/queries/accounts';

import { __stub } from '../../../../api';
import { queryClient, render, rootState, screen, waitFor } from '../../../../jest/test-helpers';
import { IChat, IChatMessage } from '../../../../queries/chats';
import ChatMessageList from '../chat-message-list';

const chat: IChat = {
  id: '14',
  unread: 5,
  created_by_account: '2',
  account: {
    id: '1',
    avatar: 'url',
    acct: 'username',
  } as IAccount,
  last_message: null,
  accepted: true,
} as IChat;

const chatMessages: IChatMessage[] = [
  {
    account_id: '1',
    chat_id: '14',
    content: 'this is the first chat',
    created_at: '2022-09-09T16:02:26.186Z',
    id: '1',
    unread: false,
    pending: false,
  },
  {
    account_id: '2',
    chat_id: '14',
    content: 'this is the second chat',
    created_at: '2022-09-09T16:04:26.186Z',
    id: '2',
    unread: true,
    pending: false,
  },
];

// Mock scrollIntoView function.
window.HTMLElement.prototype.scrollIntoView = function () { };
Object.assign(navigator, {
  clipboard: {
    writeText: () => { },
  },
});

const store = rootState
  .set('me', '1')
  .set('instance', normalizeInstance({ version: '3.4.1 (compatible; TruthSocial 1.0.0)' }));

const renderComponentWithChatContext = () => render(
  <VirtuosoMockContext.Provider value={{ viewportHeight: 300, itemHeight: 100 }}>
    <ChatContext.Provider value={{ chat }}>
      <ChatMessageList chat={chat} />
    </ChatContext.Provider>
  </VirtuosoMockContext.Provider>,
  undefined,
  store,
);

beforeEach(() => {
  queryClient.clear();
});

describe('<ChatMessageList />', () => {
  describe('when the query is loading', () => {
    beforeEach(() => {
      __stub((mock) => {
        mock.onGet(`/api/v1/pleroma/chats/${chat.id}/messages`).reply(200, chatMessages, {
          link: null,
        });
      });
    });

    it('displays the skeleton loader', async () => {
      renderComponentWithChatContext();

      expect(screen.queryAllByTestId('placeholder-chat-message')).toHaveLength(5);

      await waitFor(() => {
        expect(screen.getByTestId('chat-message-list-intro')).toBeInTheDocument();
        expect(screen.queryAllByTestId('placeholder-chat-message')).toHaveLength(0);
      });
    });
  });

  describe('when the query is finished loading', () => {
    beforeEach(() => {
      __stub((mock) => {
        mock.onGet(`/api/v1/pleroma/chats/${chat.id}/messages`).reply(200, chatMessages, {
          link: null,
        });
      });
    });

    it('displays the intro', async () => {
      renderComponentWithChatContext();

      expect(screen.queryAllByTestId('chat-message-list-intro')).toHaveLength(0);

      await waitFor(() => {
        expect(screen.getByTestId('chat-message-list-intro')).toBeInTheDocument();
      });
    });

    it('displays the messages', async () => {
      renderComponentWithChatContext();

      expect(screen.queryAllByTestId('chat-message')).toHaveLength(0);

      await waitFor(() => {
        expect(screen.queryAllByTestId('chat-message')).toHaveLength(chatMessages.length);
        expect(screen.queryAllByTestId('chat-message')[0]).toHaveTextContent(chatMessages[0].content);
      });
    });

    it('displays the correct menu options depending on the owner of the message', async () => {
      renderComponentWithChatContext();

      await waitFor(() => {
        expect(screen.queryAllByTestId('chat-message-menu')).toHaveLength(2);
      });

      // my message
      await userEvent.click(screen.queryAllByTestId('chat-message-menu')[0].querySelector('button') as any);
      expect(screen.getByTestId('dropdown-menu')).toHaveTextContent('Delete for both');
      expect(screen.getByTestId('dropdown-menu')).not.toHaveTextContent('Report');
      expect(screen.getByTestId('dropdown-menu')).toHaveTextContent('Copy');

      // other user message
      await userEvent.click(screen.queryAllByTestId('chat-message-menu')[1].querySelector('button') as any);
      expect(screen.getByTestId('dropdown-menu')).toHaveTextContent('Delete for me');
      expect(screen.getByTestId('dropdown-menu')).toHaveTextContent('Report');
      expect(screen.getByTestId('dropdown-menu')).toHaveTextContent('Copy');
    });
  });
});
