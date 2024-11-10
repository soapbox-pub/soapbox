import { beforeEach, describe, expect, it } from 'vitest';

import { __stub } from 'soapbox/api/index.ts';
import { buildGroup } from 'soapbox/jest/factory.ts';
import { renderHook, waitFor } from 'soapbox/jest/test-helpers.tsx';

import { useGroup } from './useGroup.ts';

const group = buildGroup({ id: '1', display_name: 'soapbox' });

describe('useGroup hook', () => {
  describe('with a successful request', () => {
    beforeEach(() => {
      __stub((mock) => {
        mock.onGet(`/api/v1/groups/${group.id}`).reply(200, group);
      });
    });

    it('is successful', async () => {
      const { result } = renderHook(() => useGroup(group.id));

      await waitFor(() => expect(result.current.isFetching).toBe(false));

      expect(result.current.group?.id).toBe(group.id);
    });
  });

  describe('with an unsuccessful query', () => {
    beforeEach(() => {
      __stub((mock) => {
        mock.onGet(`/api/v1/groups/${group.id}`).networkError();
      });
    });

    it('is has error state', async() => {
      const { result } = renderHook(() => useGroup(group.id));

      await waitFor(() => expect(result.current.isFetching).toBe(false));

      expect(result.current.group).toBeUndefined();
    });
  });
});