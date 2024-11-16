import { beforeEach, describe, expect, it } from 'vitest';

import { __stub } from 'soapbox/api/index.ts';
import { buildStatus } from 'soapbox/jest/factory.ts';
import { renderHook, waitFor } from 'soapbox/jest/test-helpers.tsx';

import { useGroupMedia } from './useGroupMedia.ts';

const status = buildStatus();
const groupId = '1';

describe('useGroupMedia hook', () => {
  describe('with a successful request', () => {
    beforeEach(() => {
      __stub((mock) => {
        mock.onGet(`/api/v1/timelines/group/${groupId}?only_media=true`).reply(200, [status]);
      });
    });

    it('is successful', async () => {
      const { result } = renderHook(() => useGroupMedia(groupId));

      await waitFor(() => expect(result.current.isFetching).toBe(false));

      expect(result.current.entities.length).toBe(1);
      expect(result.current.entities[0].id).toBe(status.id);
    });
  });

  describe('with an unsuccessful query', () => {
    beforeEach(() => {
      __stub((mock) => {
        mock.onGet(`/api/v1/timelines/group/${groupId}?only_media=true`).networkError();
      });
    });

    it('is has error state', async() => {
      const { result } = renderHook(() => useGroupMedia(groupId));

      await waitFor(() => expect(result.current.isFetching).toBe(false));

      expect(result.current.entities.length).toBe(0);
      expect(result.current.isError).toBeTruthy();
    });
  });
});