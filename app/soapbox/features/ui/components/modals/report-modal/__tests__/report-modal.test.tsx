test.skip('skip', () => {});

// import userEvent from '@testing-library/user-event';
// import { Map as ImmutableMap, Record as ImmutableRecord, Set as ImmutableSet } from 'immutable';
// import React from 'react';

// import { ReportableEntities } from 'soapbox/actions/reports';
// import { __stub } from 'soapbox/api';
// import { buildAccount } from 'soapbox/jest/factory';
// import { render, screen, waitFor } from 'soapbox/jest/test-helpers';
// import { normalizeStatus } from 'soapbox/normalizers';

// import ReportModal from '../report-modal';

// describe('<ReportModal />', () => {
//   let store: any;

//   beforeEach(() => {
//     const rules = require('soapbox/__fixtures__/rules.json');
//     const status = require('soapbox/__fixtures__/status-unordered-mentions.json');

//     store = {
//       accounts: {
//         '1': buildAccount({
//           id: '1',
//           acct: 'username',
//           display_name: 'My name',
//           avatar: 'test.jpg',
//         }),
//       },
//       reports: ImmutableRecord({
//         new: ImmutableRecord({
//           account_id: '1',
//           status_ids: ImmutableSet(['1']),
//           rule_ids: ImmutableSet(),
//           entityType: ReportableEntities.STATUS,
//         })(),
//       })(),
//       statuses: ImmutableMap({
//         '1': normalizeStatus(status),
//       }),
//       rules: {
//         items: rules,
//       },
//     };

//     __stub(mock => {
//       mock.onGet('/api/v1/instance/rules').reply(200, rules);
//       mock.onPost('/api/v1/reports').reply(200, {});
//     });
//   });

//   it('successfully renders the first step', () => {
//     render(<ReportModal onClose={jest.fn} />, {}, store);
//     expect(screen.getByText('Reason for reporting')).toBeInTheDocument();
//   });

//   it('successfully moves to the second step', async() => {
//     const user = userEvent.setup();
//     render(<ReportModal onClose={jest.fn} />, {}, store);
//     await user.click(screen.getByTestId('rule-1'));
//     await user.click(screen.getByText('Next'));
//     expect(screen.getByText(/Further actions:/)).toBeInTheDocument();
//   });

//   it('successfully moves to the third step', async() => {
//     const user = userEvent.setup();
//     render(<ReportModal onClose={jest.fn} />, {}, store);
//     await user.click(screen.getByTestId('rule-1'));
//     await user.click(screen.getByText(/Next/));
//     await user.click(screen.getByText(/Submit/));

//     await waitFor(() => {
//       expect(screen.getByText(/Thanks for submitting your report/)).toBeInTheDocument();
//     });
//   });
// });
