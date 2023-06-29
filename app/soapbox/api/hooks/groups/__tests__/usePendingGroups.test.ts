import { __stub } from 'soapbox/api';
import { Entities } from 'soapbox/entity-store/entities';
import { buildAccount, buildGroup } from 'soapbox/jest/factory';
import { renderHook, waitFor } from 'soapbox/jest/test-helpers';
import { normalizeInstance } from 'soapbox/normalizers';

import { usePendingGroups } from '../usePendingGroups';

const id = '1';
const group = buildGroup({ id, display_name: 'soapbox' });
const store = {
  instance: normalizeInstance({
    version: '3.4.1 (compatible; TruthSocial 1.0.0+unreleased)',
  }),
  me: '1',
  entities: {
    [Entities.ACCOUNTS]: {
      store: {
        [id]: buildAccount({
          id,
          acct: 'tiger',
          display_name: 'Tiger',
          avatar: 'test.jpg',
          verified: true,
        }),
      },
      lists: {},
    },
  },
};

describe('usePendingGroups hook', () => {
  describe('with a successful request', () => {
    beforeEach(() => {
      __stub((mock) => {
        mock.onGet('/api/v1/groups').reply(200, [group]);
      });
    });

    it('is successful', async () => {
      const { result } = renderHook(usePendingGroups, undefined, store);

      await waitFor(() => expect(result.current.isFetching).toBe(false));

      expect(result.current.groups).toHaveLength(1);
    });
  });

  describe('with an unsuccessful query', () => {
    beforeEach(() => {
      __stub((mock) => {
        mock.onGet('/api/v1/groups').networkError();
      });
    });

    it('is has error state', async() => {
      const { result } = renderHook(usePendingGroups, undefined, store);

      await waitFor(() => expect(result.current.isFetching).toBe(false));

      expect(result.current.groups).toHaveLength(0);
    });
  });
});