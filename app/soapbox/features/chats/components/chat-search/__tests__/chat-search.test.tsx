import userEvent from '@testing-library/user-event';
import React from 'react';
import { VirtuosoMockContext } from 'react-virtuoso';

import { __stub } from 'soapbox/api';
import { ChatProvider } from 'soapbox/contexts/chat-context';

import { render, screen, waitFor } from '../../../../../jest/test-helpers';
import ChatSearch from '../chat-search';

const renderComponent = () => render(
  <VirtuosoMockContext.Provider value={{ viewportHeight: 300, itemHeight: 100 }}>
    <ChatProvider>
      <ChatSearch />
    </ChatProvider>,
  </VirtuosoMockContext.Provider>,
);

describe('<ChatSearch />', () => {
  beforeEach(async() => {
    renderComponent();
  });

  it('renders the search input', () => {
    expect(screen.getByTestId('search')).toBeInTheDocument();
  });

  describe('when searching', () => {
    describe('with results', () => {
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
        const user = userEvent.setup();
        await user.type(screen.getByTestId('search'), 'ste');

        await waitFor(() => {
          expect(screen.queryAllByTestId('account')).toHaveLength(1);
        });
      });
    });

    describe('without results', () => {
      beforeEach(() => {
        __stub((mock) => {
          mock.onGet('/api/v1/accounts/search').reply(200, []);
        });
      });

      it('renders accounts', async() => {
        const user = userEvent.setup();
        await user.type(screen.getByTestId('search'), 'ste');

        await waitFor(() => {
          expect(screen.getByTestId('no-results')).toBeInTheDocument();
        });
      });
    });
  });
});
