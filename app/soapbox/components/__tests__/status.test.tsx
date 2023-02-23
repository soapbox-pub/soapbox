import React from 'react';

import { render, screen, rootState } from '../../jest/test-helpers';
import { normalizeStatus, normalizeAccount } from '../../normalizers';
import Status from '../status';

import type { ReducerStatus } from 'soapbox/reducers/statuses';

const account = normalizeAccount({
  id: '1',
  acct: 'alex',
});

const status = normalizeStatus({
  id: '1',
  account,
  content: 'hello world',
  contentHtml: 'hello world',
}) as ReducerStatus;

describe('<Status />', () => {
  const state = rootState.setIn(['accounts', '1'], account);

  it('renders content', () => {
    render(<Status status={status} />, undefined, state);
    screen.getByText(/hello world/i);
    expect(screen.getByTestId('status')).toHaveTextContent(/hello world/i);
  });

  describe('the Status Action Bar', () => {
    it('is rendered', () => {
      render(<Status status={status} />, undefined, state);
      expect(screen.getByTestId('status-action-bar')).toBeInTheDocument();
    });

    it('is not rendered if status is under review', () => {
      const inReviewStatus = normalizeStatus({ ...status, visibility: 'self' });
      render(<Status status={inReviewStatus as ReducerStatus} />, undefined, state);
      expect(screen.queryAllByTestId('status-action-bar')).toHaveLength(0);
    });
  });
});
