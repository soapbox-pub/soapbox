test.skip('skip', () => {});

// import userEvent from '@testing-library/user-event';
// import React from 'react';

// import { __stub } from 'soapbox/api';
// import { buildAccount } from 'soapbox/jest/factory';
// import { render, screen, waitFor } from 'soapbox/jest/test-helpers';

// import ChatPage from '../chat-page';

// describe('<ChatPage />', () => {
//   let store: any;

//   describe('before you finish onboarding', () => {
//     it('renders the Welcome component', () => {
//       render(<ChatPage />);

//       expect(screen.getByTestId('chats-welcome')).toBeInTheDocument();
//     });

//     describe('when you complete onboarding', () => {
//       const id = '1';

//       beforeEach(() => {
//         store = {
//           me: id,
//           accounts: {
//             [id]: buildAccount({
//               id,
//               acct: 'justin-username',
//               display_name: 'Justin L',
//               avatar: 'test.jpg',
//               source: {
//                 chats_onboarded: false,
//               },
//             }),
//           },
//         };

//         __stub((mock) => {
//           mock
//             .onPatch('/api/v1/accounts/update_credentials')
//             .reply(200, { chats_onboarded: true, id });
//         });
//       });

//       it('renders the Chats', async () => {
//         render(<ChatPage />, undefined, store);
//         await userEvent.click(screen.getByTestId('button'));

//         expect(screen.getByTestId('chat-page')).toBeInTheDocument();

//         await waitFor(() => {
//           expect(screen.getByTestId('toast')).toHaveTextContent('Chat Settings updated successfully');
//         });
//       });
//     });

//     describe('when the API returns an error', () => {
//       beforeEach(() => {
//         store = {
//           me: '1',
//           accounts: {
//             '1': buildAccount({
//               id: '1',
//               acct: 'justin-username',
//               display_name: 'Justin L',
//               avatar: 'test.jpg',
//               source: {
//                 chats_onboarded: false,
//               },
//             }),
//           },
//         };

//         __stub((mock) => {
//           mock
//             .onPatch('/api/v1/accounts/update_credentials')
//             .networkError();
//         });
//       });

//       it('renders the Chats', async () => {
//         render(<ChatPage />, undefined, store);
//         await userEvent.click(screen.getByTestId('button'));

//         await waitFor(() => {
//           expect(screen.getByTestId('toast')).toHaveTextContent('Chat Settings failed to update.');
//         });
//       });
//     });
//   });
// });
