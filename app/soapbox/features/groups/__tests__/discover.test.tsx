import userEvent from '@testing-library/user-event';
import React from 'react';

import { buildAccount } from 'soapbox/jest/factory';
import { render, screen, waitFor } from 'soapbox/jest/test-helpers';
import { normalizeInstance } from 'soapbox/normalizers';

import Discover from '../discover';

jest.mock('../../../hooks/useDimensions', () => ({
  useDimensions: () => [{ scrollWidth: 190 }, null, { width: 300 }],
}));

(window as any).ResizeObserver = class ResizeObserver {

  observe() { }
  disconnect() { }

};

const userId = '1';
const store: any = {
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
  instance: normalizeInstance({
    version: '3.4.1 (compatible; TruthSocial 1.0.0)',
    software: 'TRUTHSOCIAL',
  }),
};

const renderApp = () => (
  render(
    <Discover />,
    undefined,
    store,
  )
);

describe('<Discover />', () => {
  describe('before the user starts searching', () => {
    it('it should render popular groups', async () => {
      renderApp();

      await waitFor(() => {
        expect(screen.getByTestId('popular-groups')).toBeInTheDocument();
        expect(screen.getByTestId('suggested-groups')).toBeInTheDocument();
        expect(screen.getByTestId('popular-tags')).toBeInTheDocument();
        expect(screen.queryAllByTestId('recent-searches')).toHaveLength(0);
        expect(screen.queryAllByTestId('group-search-icon')).toHaveLength(0);

      });
    });
  });

  describe('when the user focuses on the input', () => {
    it('should render the search experience', async () => {
      const user = userEvent.setup();
      renderApp();

      await user.click(screen.getByTestId('search'));

      await waitFor(() => {
        expect(screen.getByTestId('group-search-icon')).toBeInTheDocument();
        expect(screen.getByTestId('recent-searches')).toBeInTheDocument();
        expect(screen.queryAllByTestId('popular-groups')).toHaveLength(0);
      });
    });
  });
});