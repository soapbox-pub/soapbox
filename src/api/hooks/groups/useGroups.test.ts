import { beforeEach, describe, expect, it } from 'vitest';

import { __stub } from 'soapbox/api/index.ts';
import { buildGroup } from 'soapbox/jest/factory.ts';
import { renderHook, waitFor } from 'soapbox/jest/test-helpers.tsx';
import { instanceV1Schema } from 'soapbox/schemas/instance.ts';

import { useGroups } from './useGroups.ts';

const group = buildGroup({ id: '1', display_name: 'soapbox' });
const store = {
  instance: instanceV1Schema.parse({
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