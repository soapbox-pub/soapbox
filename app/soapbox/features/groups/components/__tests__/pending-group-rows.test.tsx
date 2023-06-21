test.skip('skip', () => {});

// import React from 'react';
// import { VirtuosoMockContext } from 'react-virtuoso';

// import { __stub } from 'soapbox/api';
// import { buildAccount } from 'soapbox/jest/factory';
// import { render, screen, waitFor } from 'soapbox/jest/test-helpers';
// import { normalizeGroup, normalizeGroupRelationship, normalizeInstance } from 'soapbox/normalizers';

// import PendingGroupsRow from '../pending-groups-row';

// const userId = '1';
// let store: any = {
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

// const renderApp = (store: any) => (
//   render(
//     <VirtuosoMockContext.Provider value={{ viewportHeight: 300, itemHeight: 100 }}>
//       <PendingGroupsRow />
//     </VirtuosoMockContext.Provider>,
//     undefined,
//     store,
//   )
// );

// describe('<PendingGroupRows />', () => {
//   describe('without the feature', () => {
//     beforeEach(() => {
//       store = {
//         ...store,
//         instance: normalizeInstance({
//           version: '2.7.2 (compatible; Pleroma 2.3.0)',
//         }),
//       };
//     });

//     it('should not render', () => {
//       renderApp(store);
//       expect(screen.queryAllByTestId('pending-items-row')).toHaveLength(0);
//     });
//   });

//   describe('with the feature', () => {
//     beforeEach(() => {
//       store = {
//         ...store,
//         instance: normalizeInstance({
//           version: '3.4.1 (compatible; TruthSocial 1.0.0)',
//           software: 'TRUTHSOCIAL',
//         }),
//       };
//     });

//     describe('without pending group requests', () => {
//       beforeEach(() => {
//         __stub((mock) => {
//           mock.onGet('/api/v1/groups?pending=true').reply(200, []);
//         });
//       });

//       it('should not render', () => {
//         renderApp(store);
//         expect(screen.queryAllByTestId('pending-items-row')).toHaveLength(0);
//       });
//     });

//     describe('with pending group requests', () => {
//       beforeEach(() => {
//         __stub((mock) => {
//           mock.onGet('/api/v1/groups').reply(200, [
//             normalizeGroup({
//               display_name: 'Group',
//               id: '1',
//             }),
//           ]);

//           mock.onGet('/api/v1/groups/relationships?id[]=1').reply(200, [
//             normalizeGroupRelationship({
//               id: '1',
//             }),
//           ]);
//         });
//       });

//       it('should render the row', async () => {
//         renderApp(store);

//         await waitFor(() => {
//           expect(screen.queryAllByTestId('pending-items-row')).toHaveLength(1);
//         });
//       });
//     });
//   });
// });