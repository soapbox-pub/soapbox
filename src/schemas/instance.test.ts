import { instanceSchema } from './instance';

describe('instanceSchema.parse()', () => {
  it('normalizes an empty Map', () => {
    const expected = {
      configuration: {
        media_attachments: {},
        chats: {
          max_characters: 5000,
          max_media_attachments: 1,
        },
        groups: {
          max_characters_name: 50,
          max_characters_description: 160,
        },
        polls: {
          max_options: 4,
          max_characters_per_option: 25,
          min_expiration: 300,
          max_expiration: 2629746,
        },
        statuses: {
          max_characters: 500,
          max_media_attachments: 4,
        },
        translation: {
          enabled: false,
        },
        urls: {},
      },
      contact: {
        email: '',
      },
      description: '',
      domain: '',
      feature_quote: false,
      fedibird_capabilities: [],
      languages: [],
      pleroma: {
        metadata: {
          account_activation_required: false,
          birthday_min_age: 0,
          birthday_required: false,
          description_limit: 1500,
          features: [],
          federation: {
            enabled: true,
          },
        },
        stats: {},
      },
      registrations: {
        approval_required: false,
        enabled: false,
      },
      rules: [],
      stats: {},
      title: '',
      thumbnail: {
        url: '',
      },
      usage: {
        users: {
          active_month: 0,
        },
      },
      version: '0.0.0',
    };

    const result = instanceSchema.parse({});
    expect(result).toMatchObject(expected);
  });

  it('normalizes Pleroma instance with Mastodon configuration format', () => {
    const instance = require('soapbox/__fixtures__/pleroma-instance.json');

    const expected = {
      configuration: {
        statuses: {
          max_characters: 5000,
          max_media_attachments: Infinity,
        },
        polls: {
          max_options: 20,
          max_characters_per_option: 200,
          min_expiration: 0,
          max_expiration: 31536000,
        },
      },
    };

    const result = instanceSchema.parse(instance);
    expect(result).toMatchObject(expected);
  });

  it('normalizes Mastodon instance with retained configuration', () => {
    const instance = require('soapbox/__fixtures__/mastodon-instance.json');

    const expected = {
      configuration: {
        statuses: {
          max_characters: 500,
          max_media_attachments: 4,
          characters_reserved_per_url: 23,
        },
        media_attachments: {
          image_size_limit: 10485760,
          image_matrix_limit: 16777216,
          video_size_limit: 41943040,
          video_frame_rate_limit: 60,
          video_matrix_limit: 2304000,
        },
        polls: {
          max_options: 4,
          max_characters_per_option: 50,
          min_expiration: 300,
          max_expiration: 2629746,
        },
      },
    };

    const result = instanceSchema.parse(instance);
    expect(result).toMatchObject(expected);
  });

  it('normalizes Mastodon 3.0.0 instance with default configuration', () => {
    const instance = require('soapbox/__fixtures__/mastodon-3.0.0-instance.json');

    const expected = {
      configuration: {
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
    };

    const result = instanceSchema.parse(instance);
    expect(result).toMatchObject(expected);
  });

  it('normalizes Fedibird instance', () => {
    const instance = require('soapbox/__fixtures__/fedibird-instance.json');
    const result = instanceSchema.parse(instance);

    // Sets description_limit
    expect(result.pleroma.metadata.description_limit).toEqual(1500);

    // Preserves fedibird_capabilities
    expect(result.fedibird_capabilities).toEqual(instance.fedibird_capabilities);
  });

  it('normalizes Mitra instance', () => {
    const instance = require('soapbox/__fixtures__/mitra-instance.json');
    const result = instanceSchema.parse(instance);

    // Adds configuration and description_limit
    expect(result.configuration).toBeTruthy();
    expect(result.pleroma.metadata.description_limit).toBe(1500);
  });

  it('normalizes GoToSocial instance', () => {
    const instance = require('soapbox/__fixtures__/gotosocial-instance.json');
    const result = instanceSchema.parse(instance);

    // Normalizes max_toot_chars
    expect(result.configuration.statuses.max_characters).toEqual(5000);
    expect('max_toot_chars' in result).toBe(false);

    // Adds configuration and description_limit
    expect(result.configuration).toBeTruthy();
    expect(result.pleroma.metadata.description_limit).toBe(1500);
  });

  it('normalizes Friendica instance', () => {
    const instance = require('soapbox/__fixtures__/friendica-instance.json');
    const result = instanceSchema.parse(instance);

    // Normalizes max_toot_chars
    expect(result.configuration.statuses.max_characters).toEqual(200000);
    expect('max_toot_chars' in result).toBe(false);

    // Adds configuration and description_limit
    expect(result.configuration).toBeTruthy();
    expect(result.pleroma.metadata.description_limit).toBe(1500);
  });

  it('normalizes a Mastodon RC version', () => {
    const instance = require('soapbox/__fixtures__/mastodon-instance-rc.json');
    const result = instanceSchema.parse(instance);

    expect(result.version).toEqual('3.5.0-rc1');
  });

  it('normalizes Pixelfed instance', () => {
    const instance = require('soapbox/__fixtures__/pixelfed-instance.json');
    const result = instanceSchema.parse(instance);
    expect(result.title).toBe('pixelfed');
  });

  it('renames Akkoma to Pleroma', () => {
    const instance = require('soapbox/__fixtures__/akkoma-instance.json');
    const result = instanceSchema.parse(instance);

    expect(result.version).toEqual('2.7.2 (compatible; Pleroma 2.4.50+akkoma)');

  });
});
