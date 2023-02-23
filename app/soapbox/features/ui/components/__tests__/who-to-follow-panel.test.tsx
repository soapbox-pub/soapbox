import React from 'react';

import { __stub } from 'soapbox/api';

import { render, rootState, screen, waitFor } from '../../../../jest/test-helpers';
import { normalizeInstance } from '../../../../normalizers';
import WhoToFollowPanel from '../who-to-follow-panel';

const buildTruthSuggestion = (id: string) => ({
  account_avatar: 'avatar',
  account_id: id,
  acct: 'acct',
  display_name: 'my name',
  note: 'hello',
  verified: true,
});

const buildSuggestion = (id: string) => ({
  source: 'staff',
  account: {
    username: 'username',
    verified: true,
    id,
    acct: 'acct',
    avatar: 'avatar',
    avatar_static: 'avatar',
    display_name: 'my name',
  },
});

describe('<WhoToFollow />', () => {
  let store: any;

  describe('using Truth Social software', () => {
    beforeEach(() => {
      store = rootState
        .set('me', '1234')
        .set('instance', normalizeInstance({
          version: '3.4.1 (compatible; TruthSocial 1.0.0)',
        }));
    });

    describe('with a single suggestion', () => {
      beforeEach(() => {
        __stub((mock) => {
          mock.onGet('/api/v1/truth/carousels/suggestions')
            .reply(200, [buildTruthSuggestion('1')], {
              link: '<https://example.com/api/v1/truth/carousels/suggestions?since_id=1>; rel=\'prev\'',
            });
        });
      });

      it('renders suggested accounts', async () => {
        render(<WhoToFollowPanel limit={1} />, undefined, store);

        await waitFor(() => {
          expect(screen.getByTestId('account')).toHaveTextContent(/my name/i);
        });
      });
    });

    describe('with a multiple suggestion', () => {
      beforeEach(() => {
        __stub((mock) => {
          mock.onGet('/api/v1/truth/carousels/suggestions')
            .reply(200, [buildTruthSuggestion('1'), buildTruthSuggestion('2')], {
              link: '<https://example.com/api/v1/truth/carousels/suggestions?since_id=1>; rel=\'prev\'',
            });
        });
      });

      it('renders suggested accounts', async () => {
        render(<WhoToFollowPanel limit={2} />, undefined, store);

        await waitFor(() => {
          expect(screen.queryAllByTestId('account')).toHaveLength(2);
        });
      });
    });

    describe('with a set limit', () => {
      beforeEach(() => {
        __stub((mock) => {
          mock.onGet('/api/v1/truth/carousels/suggestions')
            .reply(200, [buildTruthSuggestion('1'), buildTruthSuggestion('2')], {
              link: '<https://example.com/api/v1/truth/carousels/suggestions?since_id=1>; rel=\'prev\'',
            });
        });
      });

      it('respects the limit prop', async () => {
        render(<WhoToFollowPanel limit={1} />, undefined, store);

        await waitFor(() => {
          expect(screen.queryAllByTestId('account')).toHaveLength(1);
        });
      });
    });

    describe('when the API returns an empty list', () => {
      beforeEach(() => {
        __stub((mock) => {
          mock.onGet('/api/v1/truth/carousels/suggestions')
            .reply(200, [], {
              link: '',
            });
        });
      });

      it('renders empty', async () => {
        render(<WhoToFollowPanel limit={1} />, undefined, store);

        await waitFor(() => {
          expect(screen.queryAllByTestId('account')).toHaveLength(0);
        });
      });
    });
  });

  describe('using Pleroma software', () => {
    beforeEach(() => {
      store = rootState.set('me', '1234');
    });

    describe('with a single suggestion', () => {
      beforeEach(() => {
        __stub((mock) => {
          mock.onGet('/api/v2/suggestions')
            .reply(200, [buildSuggestion('1')], {
              link: '<https://example.com/api/v2/suggestions?since_id=1>; rel=\'prev\'',
            });
        });
      });

      it('renders suggested accounts', async () => {
        render(<WhoToFollowPanel limit={1} />, undefined, store);

        await waitFor(() => {
          expect(screen.getByTestId('account')).toHaveTextContent(/my name/i);
        });
      });
    });

    describe('with a multiple suggestion', () => {
      beforeEach(() => {
        __stub((mock) => {
          mock.onGet('/api/v2/suggestions')
            .reply(200, [buildSuggestion('1'), buildSuggestion('2')], {
              link: '<https://example.com/api/v2/suggestions?since_id=1>; rel=\'prev\'',
            });
        });
      });

      it('renders suggested accounts', async () => {
        render(<WhoToFollowPanel limit={2} />, undefined, store);

        await waitFor(() => {
          expect(screen.queryAllByTestId('account')).toHaveLength(2);
        });
      });
    });

    describe('with a set limit', () => {
      beforeEach(() => {
        __stub((mock) => {
          mock.onGet('/api/v2/suggestions')
            .reply(200, [buildSuggestion('1'), buildSuggestion('2')], {
              link: '<https://example.com/api/v2/suggestions?since_id=1>; rel=\'prev\'',
            });
        });
      });

      it('respects the limit prop', async () => {
        render(<WhoToFollowPanel limit={1} />, undefined, store);

        await waitFor(() => {
          expect(screen.queryAllByTestId('account')).toHaveLength(1);
        });
      });
    });

    describe('when the API returns an empty list', () => {
      beforeEach(() => {
        __stub((mock) => {
          mock.onGet('/api/v2/suggestions')
            .reply(200, [], {
              link: '',
            });
        });
      });

      it('renders empty', async () => {
        render(<WhoToFollowPanel limit={1} />, undefined, store);

        await waitFor(() => {
          expect(screen.queryAllByTestId('account')).toHaveLength(0);
        });
      });
    });
  });
});
