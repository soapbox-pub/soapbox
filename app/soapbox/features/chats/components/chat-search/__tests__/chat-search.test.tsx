import userEvent from '@testing-library/user-event';
import React from 'react';

import { __stub } from 'soapbox/api';
import { ChatProvider } from 'soapbox/contexts/chat-context';

import { render, screen, waitFor } from '../../../../../jest/test-helpers';
import ChatSearch from '../chat-search';

const renderComponent = () => render(
  <ChatProvider>
    <ChatSearch />
  </ChatProvider>,
);

describe('<ChatSearch />', () => {
  it('renders correctly', () => {
    renderComponent();

    expect(screen.getByTestId('pane-header')).toHaveTextContent('Messages');
  });

  describe('when the pane is closed', () => {
    it('does not render the search input', () => {
      renderComponent();
      expect(screen.queryAllByTestId('search')).toHaveLength(0);
    });
  });

  describe('when the pane is open', () => {
    beforeEach(async() => {
      renderComponent();
      await userEvent.click(screen.getByTestId('icon-button'));
    });

    it('renders the search input', () => {
      expect(screen.getByTestId('search')).toBeInTheDocument();
    });

    describe('when searching', () => {
      beforeEach(() => {
        __stub((mock) => {
          mock.onGet('/api/v1/accounts/search').reply(200, [{
            id: '1',
            avatar: 'url',
            verified: false,
            display_name: 'steve',
            acct: 'sjobs',
          }]);
        });
      });

      it('renders accounts', async() => {
        renderComponent();

        const user = userEvent.setup();
        await user.type(screen.getByTestId('search'), 'ste');

        await waitFor(() => {
          expect(screen.queryAllByTestId('account')).toHaveLength(1);
        });
      });
    });
  });
});
