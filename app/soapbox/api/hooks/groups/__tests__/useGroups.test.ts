import { __stub } from 'soapbox/api';
import { buildGroup } from 'soapbox/jest/factory';
import { renderHook, waitFor } from 'soapbox/jest/test-helpers';

import { useGroups } from '../useGroups';

const group = buildGroup({ id: '1', display_name: 'soapbox' });

describe('useGroups hook', () => {
  describe('with a successful request', () => {
    beforeEach(() => {
      __stub((mock) => {
        mock.onGet('/api/v1/groups?q=').reply(200, [group]);
      });
    });

    it('is successful', async () => {
      const { result } = renderHook(() => useGroups());

      console.log(result.current);

      await waitFor(() => expect(result.current.isFetching).toBe(false));

      expect(result.current.groups.length).toHaveLength(1);
    });
  });

  // describe('with an unsuccessful query', () => {
  //   beforeEach(() => {
  //     __stub((mock) => {
  //       mock.onGet('/api/v1/groups').networkError();
  //     });
  //   });

  //   it('is has error state', async() => {
  //     const { result } = renderHook(() => useGroups());

  //     await waitFor(() => expect(result.current.isFetching).toBe(false));

  //     expect(result.current.groups).toHaveLength(0);
  //   });
  // });
});