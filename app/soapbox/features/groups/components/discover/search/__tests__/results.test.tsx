import userEvent from '@testing-library/user-event';
import React from 'react';
import { VirtuosoGridMockContext, VirtuosoMockContext } from 'react-virtuoso';

import { buildAccount, buildGroup } from 'soapbox/jest/factory';
import { render, screen, waitFor } from 'soapbox/jest/test-helpers';

import Results from '../results';

const userId = '1';
const store = {
  me: userId,
  accounts: {
    [userId]: buildAccount({
      id: userId,
      acct: 'justin-username',
      display_name: 'Justin L',
      avatar: 'test.jpg',
      source: {
        chats_onboarded: false,
      },
    }),
  },
};

const renderApp = (children: React.ReactNode) => (
  render(
    <VirtuosoMockContext.Provider value={{ viewportHeight: 300, itemHeight: 100 }}>
      <VirtuosoGridMockContext.Provider value={{ viewportHeight: 300, viewportWidth: 300, itemHeight: 100, itemWidth: 100 }}>
        {children}
      </VirtuosoGridMockContext.Provider>
    </VirtuosoMockContext.Provider>,
    undefined,
    store,
  )
);

const groupSearchResult = {
  groups: [buildGroup()],
  hasNextPage: false,
  isFetching: false,
  fetchNextPage: jest.fn(),
} as any;

describe('<Results />', () => {
  describe('with a list layout', () => {
    it('should render the GroupListItem components', async () => {
      renderApp(<Results groupSearchResult={groupSearchResult} />);
      await waitFor(() => {
        expect(screen.getByTestId('group-list-item')).toBeInTheDocument();
      });
    });
  });

  describe('with a grid layout', () => {
    it('should render the GroupGridItem components', async () => {
      const user = userEvent.setup();
      renderApp(<Results groupSearchResult={groupSearchResult} />);

      await user.click(screen.getByTestId('layout-grid-action'));

      await waitFor(() => {
        expect(screen.getByTestId('group-grid-item')).toBeInTheDocument();
      });
    });
  });
});