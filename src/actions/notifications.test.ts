import { OrderedMap as ImmutableOrderedMap } from 'immutable';
import { describe, expect, it } from 'vitest';

import { __stub } from 'soapbox/api/index.ts';
import { mockStore, rootState } from 'soapbox/jest/test-helpers.tsx';
import { normalizeNotification } from 'soapbox/normalizers/index.ts';

import { markReadNotifications } from './notifications.ts';

describe('markReadNotifications()', () => {
  it('fires off marker when top notification is newer than lastRead', async() => {
    __stub((mock) => mock.onPost('/api/v1/markers').reply(200, {}));

    const items = ImmutableOrderedMap({
      '10': normalizeNotification({ id: '10' }),
    });

    const state = {
      ...rootState,
      me: '123',
      notifications: rootState.notifications.merge({
        lastRead: '9',
        items,
      }),
    };

    const store = mockStore(state);

    const expectedActions = [{
      type: 'MARKER_SAVE_REQUEST',
      marker: {
        notifications: {
          last_read_id: '10',
        },
      },
    }];

    store.dispatch(markReadNotifications());
    const actions = store.getActions();

    expect(actions).toEqual(expectedActions);
  });
});
