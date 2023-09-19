test.skip('skip', () => {});

// import React from 'react';
// import { VirtuosoMockContext } from 'react-virtuoso';

// import { __stub } from 'soapbox/api';
// import { buildAccount } from 'soapbox/jest/factory';
// import { render, screen, waitFor } from 'soapbox/jest/test-helpers';
// import { normalizeGroup, normalizeGroupRelationship, normalizeInstance } from 'soapbox/normalizers';

// import PendingRequests from '../pending-requests';

// const userId = '1';
// const store: any = {
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
//   instance: normalizeInstance({
//     version: '3.4.1 (compatible; TruthSocial 1.0.0)',
//   }),
// };

// const renderApp = () => (
//   render(
//     <VirtuosoMockContext.Provider value={{ viewportHeight: 300, itemHeight: 100 }}>
//       <PendingRequests />
//     </VirtuosoMockContext.Provider>,
//     undefined,
//     store,
//   )
// );

// describe('<PendingRequests />', () => {
//   describe('without pending group requests', () => {
//     beforeEach(() => {
//       __stub((mock) => {
//         mock.onGet('/api/v1/groups?pending=true').reply(200, []);
//       });
//     });

//     it('should render the blankslate', async () => {
//       renderApp();

//       await waitFor(() => {
//         expect(screen.getByTestId('pending-requests-blankslate')).toBeInTheDocument();
//         expect(screen.queryAllByTestId('group-card')).toHaveLength(0);
//       });
//     });
//   });

//   describe('with pending group requests', () => {
//     beforeEach(() => {
//       __stub((mock) => {
//         mock.onGet('/api/v1/groups').reply(200, [
//           normalizeGroup({
//             display_name: 'Group',
//             id: '1',
//           }),
//         ]);

//         mock.onGet('/api/v1/groups/relationships?id[]=1').reply(200, [
//           normalizeGroupRelationship({
//             id: '1',
//           }),
//         ]);
//       });
//     });

//     it('should render the groups', async () => {
//       renderApp();

//       await waitFor(() => {
//         expect(screen.queryAllByTestId('group-card')).toHaveLength(1);
//         expect(screen.queryAllByTestId('pending-requests-blankslate')).toHaveLength(0);
//       });
//     });
//   });
// });