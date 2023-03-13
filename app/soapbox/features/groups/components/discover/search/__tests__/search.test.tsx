import React from 'react';

import { __stub } from 'soapbox/api';
import { buildGroup } from 'soapbox/jest/factory';
import { render, screen, waitFor } from 'soapbox/jest/test-helpers';
import { normalizeInstance } from 'soapbox/normalizers';

import Search from '../search';

const store = {
  instance: normalizeInstance({
    version: '3.4.1 (compatible; TruthSocial 1.0.0+unreleased)',
  }),
};

const renderApp = (children: React.ReactElement) => render(children, undefined, store);

describe('<Search />', () => {
  describe('with no results', () => {
    beforeEach(() => {
      __stub((mock) => {
        mock.onGet('/api/v1/groups/search').reply(200, []);
      });
    });

    it('should render the blankslate', async () => {
      renderApp(<Search searchValue={'some-search'} onSelect={jest.fn()} />);

      await waitFor(() => {
        expect(screen.getByTestId('no-results')).toBeInTheDocument();
      });
    });
  });

  describe('with results', () => {
    beforeEach(() => {
      __stub((mock) => {
        mock.onGet('/api/v1/groups/search').reply(200, [
          buildGroup({
            display_name: 'Group',
            id: '1',
          }),
        ]);
      });
    });

    it('should render the results', async () => {
      renderApp(<Search searchValue={'some-search'} onSelect={jest.fn()} />);

      await waitFor(() => {
        expect(screen.getByTestId('results')).toBeInTheDocument();
      });
    });
  });

  describe('before starting a search', () => {
    it('should render the RecentSearches component', () => {
      renderApp(<Search searchValue={''} onSelect={jest.fn()} />);

      expect(screen.getByTestId('recent-searches')).toBeInTheDocument();
    });
  });
});