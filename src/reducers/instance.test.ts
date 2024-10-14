import { ADMIN_CONFIG_UPDATE_REQUEST } from 'soapbox/actions/admin';

import reducer from './instance';

describe('instance reducer', () => {
  it('should return the initial state', () => {
    const result = reducer(undefined, {} as any);

    const expected = {
      description_limit: 1500,
      configuration: {
        chats: {
          max_characters: 5000,
          max_media_attachments: 1,
        },
        statuses: {
          max_characters: 500,
          max_media_attachments: 4,
        },
        polls: {
          max_options: 4,
          max_characters_per_option: 25,
          min_expiration: 300,
          max_expiration: 2629746,
        },
      },
      version: '0.0.0',
    };

    expect(result).toMatchObject(expected);
  });

  describe('ADMIN_CONFIG_UPDATE_REQUEST', async () => {
    const { configs } = await import('soapbox/__fixtures__/pleroma-admin-config.json');

    it('imports the configs', () => {
      const action = {
        type: ADMIN_CONFIG_UPDATE_REQUEST,
        configs,
      };

      // The normalizer has `registrations: closed` by default
      const state = reducer(undefined, {} as any);
      expect(state.registrations).toBe(false);

      // After importing the configs, registration will be open
      // @ts-ignore don't know why the type is not working
      const result = reducer(state, action);
      expect(result.registrations).toBe(true);
    });
  });
});
