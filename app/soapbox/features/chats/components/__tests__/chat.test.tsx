import React from 'react';

import { IChat } from 'soapbox/queries/chats';

import { render, screen } from '../../../../jest/test-helpers';
import Chat from '../chat';

const chat: any = {
  id: '1',
  unread: 5,
  created_by_account: '2',
  last_message: {
    account_id: '2',
    chat_id: '1',
    content: 'hello world',
    created_at: '2022-09-09T16:02:26.186Z',
    discarded_at: null,
    id: '12332423234',
    unread: true,
  },
  created_at: new Date('2022-09-09T16:02:26.186Z'),
  updated_at: new Date('2022-09-09T16:02:26.186Z'),
  accepted: true,
  discarded_at: null,
  account: {
    acct: 'username',
    display_name: 'johnnie',
  },
};

describe('<Chat />', () => {
  it('renders correctly', () => {
    render(<Chat chat={chat as IChat} onClick={jest.fn()} />);

    expect(screen.getByTestId('chat')).toBeInTheDocument();
    expect(screen.getByTestId('chat')).toHaveTextContent(chat.account.display_name);
  });

  describe('last message content', () => {
    it('renders the last message', () => {
      render(<Chat chat={chat as IChat} onClick={jest.fn()} />);

      expect(screen.getByTestId('chat-last-message')).toBeInTheDocument();
    });

    it('does not render the last message', () => {
      const changedChat = { ...chat, last_message: null };
      render(<Chat chat={changedChat as IChat} onClick={jest.fn()} />);

      expect(screen.queryAllByTestId('chat-last-message')).toHaveLength(0);
    });

    describe('unread', () => {
      it('renders the unread dot', () => {
        render(<Chat chat={chat as IChat} onClick={jest.fn()} />);

        expect(screen.getByTestId('chat-unread-indicator')).toBeInTheDocument();
      });

      it('does not render the unread dot', () => {
        const changedChat = { ...chat, last_message: { ...chat.last_message, unread: false } };
        render(<Chat chat={changedChat as IChat} onClick={jest.fn()} />);

        expect(screen.queryAllByTestId('chat-unread-indicator')).toHaveLength(0);
      });
    });
  });
});
