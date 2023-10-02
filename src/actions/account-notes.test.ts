import { __stub } from 'soapbox/api';
import { mockStore, rootState } from 'soapbox/jest/test-helpers';

import { submitAccountNote } from './account-notes';

describe('submitAccountNote()', () => {
  let store: ReturnType<typeof mockStore>;

  beforeEach(() => {
    store = mockStore(rootState);
  });

  describe('with a successful API request', () => {
    beforeEach(() => {
      __stub((mock) => {
        mock.onPost('/api/v1/accounts/1/note').reply(200, {});
      });
    });

    it('post the note to the API', async() => {
      const expectedActions = [
        { type: 'ACCOUNT_NOTE_SUBMIT_REQUEST' },
        { type: 'ACCOUNT_NOTE_SUBMIT_SUCCESS', relationship: {} },
      ];
      await store.dispatch(submitAccountNote('1', 'hello'));
      const actions = store.getActions();

      expect(actions).toEqual(expectedActions);
    });
  });

  describe('with an unsuccessful API request', () => {
    beforeEach(() => {
      __stub((mock) => {
        mock.onPost('/api/v1/accounts/1/note').networkError();
      });
    });

    it('should dispatch failed action', async() => {
      const expectedActions = [
        { type: 'ACCOUNT_NOTE_SUBMIT_REQUEST' },
        {
          type: 'ACCOUNT_NOTE_SUBMIT_FAIL',
          error: new Error('Network Error'),
        },
      ];
      await store.dispatch(submitAccountNote('1', 'hello'));
      const actions = store.getActions();

      expect(actions).toEqual(expectedActions);
    });
  });
});
