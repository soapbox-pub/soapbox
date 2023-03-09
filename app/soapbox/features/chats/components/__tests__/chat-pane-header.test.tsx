import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen } from '../../../../jest/test-helpers';
import ChatPaneHeader from '../chat-widget/chat-pane-header';

describe('<ChatPaneHeader />', () => {
  it('handles the onToggle prop', async () => {
    const mockFn = jest.fn();
    render(<ChatPaneHeader title='title' onToggle={mockFn} isOpen />);

    await userEvent.click(screen.getByTestId('icon-button'));
    expect(mockFn).toHaveBeenCalled();
  });

  describe('the "title" prop', () => {
    describe('when it is a string', () => {
      it('renders the title', () => {
        const title = 'Messages';
        render(<ChatPaneHeader title={title} onToggle={jest.fn()} isOpen />);

        expect(screen.getByTestId('title')).toHaveTextContent(title);
      });
    });

    describe('when it is a node', () => {
      it('renders the title', () => {
        const title = (
          <div><p>hello world</p></div>
        );
        render(<ChatPaneHeader title={title} onToggle={jest.fn()} isOpen />);

        expect(screen.getByTestId('title')).toHaveTextContent('hello world');
      });
    });
  });

  describe('the "unreadCount" prop', () => {
    describe('when present', () => {
      it('renders the unread count', () => {
        const count = 14;
        render(<ChatPaneHeader title='title' onToggle={jest.fn()} isOpen unreadCount={count} />);

        expect(screen.getByTestId('unread-count')).toHaveTextContent(String(count));
      });
    });

    describe('when 0', () => {
      it('does not render the unread count', () => {
        const count = 0;
        render(<ChatPaneHeader title='title' onToggle={jest.fn()} isOpen unreadCount={count} />);

        expect(screen.queryAllByTestId('unread-count')).toHaveLength(0);
      });
    });

    describe('when unprovided', () => {
      it('does not render the unread count', () => {
        render(<ChatPaneHeader title='title' onToggle={jest.fn()} isOpen />);

        expect(screen.queryAllByTestId('unread-count')).toHaveLength(0);
      });
    });
  });

  describe('secondaryAction prop', () => {
    it('handles the secondaryAction callback', async () => {
      const mockFn = jest.fn();
      render(
        <ChatPaneHeader
          title='title'
          onToggle={jest.fn()}
          isOpen
          secondaryAction={mockFn}
          secondaryActionIcon='icon.svg'
        />,
      );

      await userEvent.click(screen.queryAllByTestId('icon-button')[0]);
      expect(mockFn).toBeCalled();
    });
  });
});
