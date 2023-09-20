import { Map as ImmutableMap } from 'immutable';

import { __stub } from 'soapbox/api';
import { mockStore, rootState } from 'soapbox/jest/test-helpers';
import { StatusListRecord } from 'soapbox/reducers/status-lists';

import { fetchStatusQuotes, expandStatusQuotes } from '../status-quotes';

const status = {
  account: {
    id: 'ABDSjI3Q0R8aDaz1U0',
  },
  content: 'quoast',
  id: 'AJsajx9hY4Q7IKQXEe',
  pleroma: {
    quote: {
      content: '<p>10</p>',
      id: 'AJmoVikzI3SkyITyim',
    },
  },
};

const statusId = 'AJmoVikzI3SkyITyim';

describe('fetchStatusQuotes()', () => {
  let store: ReturnType<typeof mockStore>;

  beforeEach(() => {
    const state = rootState.set('me', '1234');
    store = mockStore(state);
  });

  describe('with a successful API request', () => {
    beforeEach(() => {
      const quotes = require('soapbox/__fixtures__/status-quotes.json');

      __stub((mock) => {
        mock.onGet(`/api/v1/pleroma/statuses/${statusId}/quotes`).reply(200, quotes, {
          link: `<https://example.com/api/v1/pleroma/statuses/${statusId}/quotes?since_id=1>; rel='prev'`,
        });
      });
    });

    it('should fetch quotes from the API', async() => {
      const expectedActions = [
        { type: 'STATUS_QUOTES_FETCH_REQUEST', statusId },
        { type: 'POLLS_IMPORT', polls: [] },
        { type: 'ACCOUNTS_IMPORT', accounts: [status.account] },
        { type: 'STATUSES_IMPORT', statuses: [status], expandSpoilers: false },
        { type: 'STATUS_QUOTES_FETCH_SUCCESS', statusId, statuses: [status], next: null },
      ];
      await store.dispatch(fetchStatusQuotes(statusId));
      const actions = store.getActions();

      expect(actions).toEqual(expectedActions);
    });
  });

  describe('with an unsuccessful API request', () => {
    beforeEach(() => {
      __stub((mock) => {
        mock.onGet(`/api/v1/pleroma/statuses/${statusId}/quotes`).networkError();
      });
    });

    it('should dispatch failed action', async() => {
      const expectedActions = [
        { type: 'STATUS_QUOTES_FETCH_REQUEST', statusId },
        { type: 'STATUS_QUOTES_FETCH_FAIL', statusId, error: new Error('Network Error') },
      ];
      await store.dispatch(fetchStatusQuotes(statusId));
      const actions = store.getActions();

      expect(actions).toEqual(expectedActions);
    });
  });
});

describe('expandStatusQuotes()', () => {
  let store: ReturnType<typeof mockStore>;

  describe('without a url', () => {
    beforeEach(() => {
      const state = rootState
        .set('me', '1234')
        .set('status_lists', ImmutableMap({ [`quotes:${statusId}`]: StatusListRecord({ next: null }) }));
      store = mockStore(state);
    });

    it('should do nothing', async() => {
      await store.dispatch(expandStatusQuotes(statusId));
      const actions = store.getActions();

      expect(actions).toEqual([]);
    });
  });

  describe('with a url', () => {
    beforeEach(() => {
      const state = rootState.set('me', '1234')
        .set('status_lists', ImmutableMap({ [`quotes:${statusId}`]: StatusListRecord({ next: 'example' }) }));
      store = mockStore(state);
    });

    describe('with a successful API request', () => {
      beforeEach(() => {
        const quotes = require('soapbox/__fixtures__/status-quotes.json');

        __stub((mock) => {
          mock.onGet('example').reply(200, quotes, {
            link: `<https://example.com/api/v1/pleroma/statuses/${statusId}/quotes?since_id=1>; rel='prev'`,
          });
        });
      });

      it('should fetch quotes from the API', async() => {
        const expectedActions = [
          { type: 'STATUS_QUOTES_EXPAND_REQUEST', statusId },
          { type: 'POLLS_IMPORT', polls: [] },
          { type: 'ACCOUNTS_IMPORT', accounts: [status.account] },
          { type: 'STATUSES_IMPORT', statuses: [status], expandSpoilers: false },
          { type: 'STATUS_QUOTES_EXPAND_SUCCESS', statusId, statuses: [status], next: null },
        ];
        await store.dispatch(expandStatusQuotes(statusId));
        const actions = store.getActions();

        expect(actions).toEqual(expectedActions);
      });
    });

    describe('with an unsuccessful API request', () => {
      beforeEach(() => {
        __stub((mock) => {
          mock.onGet('example').networkError();
        });
      });

      it('should dispatch failed action', async() => {
        const expectedActions = [
          { type: 'STATUS_QUOTES_EXPAND_REQUEST', statusId },
          { type: 'STATUS_QUOTES_EXPAND_FAIL', statusId, error: new Error('Network Error') },
        ];
        await store.dispatch(expandStatusQuotes(statusId));
        const actions = store.getActions();

        expect(actions).toEqual(expectedActions);
      });
    });
  });
});
