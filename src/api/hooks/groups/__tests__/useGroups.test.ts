import { __stub } from 'soapbox/api';
import { buildGroup } from 'soapbox/jest/factory';
import { renderHook, waitFor } from 'soapbox/jest/test-helpers';
import { normalizeInstance } from 'soapbox/normalizers';

import { useGroups } from '../useGroups';

const group = buildGroup({ id: '1', display_name: 'soapbox' });
const store = {
  instance: normalizeInstance({
    version: '3.4.1 (compatible; TruthSocial 1.0.0+unreleased)',
  }),
};

describe('useGroups hook', () => {
  describe('with a successful request', () => {
    beforeEach(() => {
      __stub((mock) => {
        mock.onGet('/api/v1/groups').reply(200, [group]);
      });
    });

    it('is successful', async () => {
      const { result } = renderHook(useGroups, undefined, store);

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
      const { result } = renderHook(useGroups, undefined, store);

      await waitFor(() => expect(result.current.isFetching).toBe(false));

      expect(result.current.groups).toHaveLength(0);
    });
  });
});