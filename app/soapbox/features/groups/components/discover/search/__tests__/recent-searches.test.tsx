test.skip('skip', () => {});

// import userEvent from '@testing-library/user-event';
// import React from 'react';
// import { VirtuosoMockContext } from 'react-virtuoso';

// import { buildAccount } from 'soapbox/jest/factory';
// import { render, screen, waitFor } from 'soapbox/jest/test-helpers';
// import { groupSearchHistory } from 'soapbox/settings';
// import { clearRecentGroupSearches, saveGroupSearch } from 'soapbox/utils/groups';

// import RecentSearches from '../recent-searches';

// const userId = '1';
// const store = {
//   me: userId,
//   accounts: {
//     [userId]: buildAccount({
//       id: userId,
//       acct: 'justin-username',
//       display_name: 'Justin L',
//       avatar: 'test.jpg',
//       source: {
//         chats_onboarded: false,
//       },
//     }),
//   },
// };

// const renderApp = (children: React.ReactNode) => (
//   render(
//     <VirtuosoMockContext.Provider value={{ viewportHeight: 300, itemHeight: 100 }}>
//       {children}
//     </VirtuosoMockContext.Provider>,
//     undefined,
//     store,
//   )
// );

// describe('<RecentSearches />', () => {
//   describe('with recent searches', () => {
//     beforeEach(() => {
//       saveGroupSearch(userId, 'foobar');
//     });

//     afterEach(() => {
//       clearRecentGroupSearches(userId);
//     });

//     it('should render the recent searches', async () => {
//       renderApp(<RecentSearches onSelect={jest.fn()} />);

//       await waitFor(() => {
//         expect(screen.getByTestId('recent-search')).toBeInTheDocument();
//       });
//     });

//     it('should support clearing recent searches', async () => {
//       renderApp(<RecentSearches onSelect={jest.fn()} />);

//       expect(groupSearchHistory.get(userId)).toHaveLength(1);
//       await userEvent.click(screen.getByTestId('clear-recent-searches'));
//       expect(groupSearchHistory.get(userId)).toBeNull();
//     });

//     it('should support click events on the results', async () => {
//       const handler = jest.fn();
//       renderApp(<RecentSearches onSelect={handler} />);
//       expect(handler.mock.calls.length).toEqual(0);
//       await userEvent.click(screen.getByTestId('recent-search-result'));
//       expect(handler.mock.calls.length).toEqual(1);
//     });
//   });

//   describe('without recent searches', () => {
//     it('should render the blankslate', async () => {
//       renderApp(<RecentSearches onSelect={jest.fn()} />);

//       expect(screen.getByTestId('recent-searches-blankslate')).toBeInTheDocument();
//     });
//   });
// });