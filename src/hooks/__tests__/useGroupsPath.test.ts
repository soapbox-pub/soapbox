import { __stub } from 'soapbox/api';
import { buildAccount, buildGroup, buildGroupRelationship } from 'soapbox/jest/factory';
import { renderHook, waitFor } from 'soapbox/jest/test-helpers';
import { normalizeInstance } from 'soapbox/normalizers';

import { useGroupsPath } from '../useGroupsPath';

describe('useGroupsPath()', () => {
  test('without the groupsDiscovery feature', () => {
    const store = {
      instance: normalizeInstance({
        version: '2.7.2 (compatible; Pleroma 2.3.0)',
      }),
    };

    const { result } = renderHook(useGroupsPath, undefined, store);

    expect(result.current).toEqual('/groups');
  });

  describe('with the "groupsDiscovery" feature', () => {
    let store: any;

    beforeEach(() => {
      const userId = '1';
      store = {
        instance: normalizeInstance({
          version: '3.4.1 (compatible; TruthSocial 1.0.0+unreleased)',
        }),
        me: userId,
        accounts: {
          [userId]: buildAccount({
            id: userId,
            acct: 'justin-username',
            display_name: 'Justin L',
            avatar: 'test.jpg',
            source: {
              chats_onboarded: false,
            },
          }),
        },
      };
    });

    describe('when the user has no groups', () => {
      test('should default to the discovery page', () => {
        const { result } = renderHook(useGroupsPath, undefined, store);

        expect(result.current).toEqual('/groups/discover');
      });
    });

    describe('when the user has groups', () => {
      beforeEach(() => {
        __stub((mock) => {
          mock.onGet('/api/v1/groups').reply(200, [
            buildGroup({
              display_name: 'Group',
              id: '1',
            }),
          ]);

          mock.onGet('/api/v1/groups/relationships?id[]=1').reply(200, [
            buildGroupRelationship({
              id: '1',
            }),
          ]);
        });
      });

      test('should default to the "My Groups" page', async () => {
        const { result } = renderHook(useGroupsPath, undefined, store);

        await waitFor(() => {
          expect(result.current).toEqual('/groups');
        });
      });
    });
  });
});
