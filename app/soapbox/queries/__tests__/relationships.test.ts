import { useEffect } from 'react';

import { __stub } from 'soapbox/api';
import { buildRelationship } from 'soapbox/jest/factory';
import { createTestStore, queryClient, renderHook, rootState, waitFor } from 'soapbox/jest/test-helpers';
import { Store } from 'soapbox/store';

import { useFetchRelationships } from '../relationships';

describe('useFetchRelationships()', () => {
  let store: Store;

  beforeEach(() => {
    const state = rootState;
    store = createTestStore(state);

    queryClient.clear();
  });

  describe('with a successful query', () => {
    describe('with one relationship', () => {
      const id = '123';

      beforeEach(() => {
        __stub((mock) => {
          mock
            .onGet(`/api/v1/accounts/relationships?id[]=${id}`)
            .reply(200, [buildRelationship({ id, blocked_by: true })]);
        });
      });

      it('is successful', async() => {
        renderHook(() => {
          const fetchRelationships = useFetchRelationships();

          useEffect(() => {
            fetchRelationships.mutate({ accountIds: [id] });
          }, []);

          return fetchRelationships;
        }, undefined, store);

        await waitFor(() => {
          expect(store.getState().relationships.size).toBe(1);
          expect(store.getState().relationships.getIn([id, 'id'])).toBe(id);
          expect(store.getState().relationships.getIn([id, 'blocked_by'])).toBe(true);
        });
      });
    });

    describe('with multiple relationships', () => {
      const ids = ['123', '456'];

      beforeEach(() => {
        __stub((mock) => {
          mock
            .onGet(`/api/v1/accounts/relationships?id[]=${ids[0]}&id[]=${ids[1]}`)
            .reply(200, ids.map((id) => buildRelationship({ id, blocked_by: true })));
        });
      });

      it('is successful', async() => {
        renderHook(() => {
          const fetchRelationships = useFetchRelationships();

          useEffect(() => {
            fetchRelationships.mutate({ accountIds: ids });
          }, []);

          return fetchRelationships;
        }, undefined, store);

        await waitFor(() => {
          expect(store.getState().relationships.size).toBe(2);
          expect(store.getState().relationships.getIn([ids[0], 'id'])).toBe(ids[0]);
          expect(store.getState().relationships.getIn([ids[1], 'id'])).toBe(ids[1]);
        });
      });
    });
  });

  describe('with an unsuccessful query', () => {
    const id = '123';

    beforeEach(() => {
      __stub((mock) => {
        mock.onGet(`/api/v1/accounts/relationships?id[]=${id}`).networkError();
      });
    });

    it('is successful', async() => {
      const { result } = renderHook(() => {
        const fetchRelationships = useFetchRelationships();

        useEffect(() => {
          fetchRelationships.mutate({ accountIds: [id] });
        }, []);

        return fetchRelationships;
      }, undefined, store);

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.error).toBeDefined();
    });
  });
});
