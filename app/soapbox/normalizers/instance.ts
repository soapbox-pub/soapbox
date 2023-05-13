/**
 * Instance normalizer:
 * Converts API instances into our internal format.
 * @see {@link https://docs.joinmastodon.org/entities/instance/}
 */
import {
  Map as ImmutableMap,
  List as ImmutableList,
  Record as ImmutableRecord,
  fromJS,
} from 'immutable';

import { parseVersion, PLEROMA } from 'soapbox/utils/features';
import { mergeDefined } from 'soapbox/utils/normalizers';
import { isNumber } from 'soapbox/utils/numbers';

// Use Mastodon defaults
// https://docs.joinmastodon.org/entities/instance/
export const InstanceRecord = ImmutableRecord({
  contact: ImmutableMap<string, any>({
    account: ImmutableMap<string, any>(),
    email: '',
  }),
  configuration: ImmutableMap<string, any>({
    chats: ImmutableMap<string, number>({
      max_characters: 5000,
      max_media_attachments: 1,
    }),
    groups: ImmutableMap<string, number>({
      max_characters_name: 50,
      max_characters_description: 160,
    }),
    media_attachments: ImmutableMap<string, any>(),
    polls: ImmutableMap<string, number>({
      max_options: 4,
      max_characters_per_option: 25,
      min_expiration: 300,
      max_expiration: 2629746,
    }),
    statuses: ImmutableMap<string, number>({
      max_characters: 500,
      max_media_attachments: 4,
    }),
    translation: ImmutableMap<string, any>({ enabled: false }),
    urls: ImmutableMap<string, string>(),
  }),
  description: '',
  domain: '',
  email: '',
  languages: ImmutableList(),
  registrations: ImmutableMap<string, any>({
    approval_required: false,
    enabled: false,
    message: '',
  }),
  rules: ImmutableList(),
  source_url: '',
  stats: ImmutableMap<string, number>(),
  title: '',
  thumbnail: ImmutableMap<string, any>(),
  usage: ImmutableMap<string, any>({
    users: ImmutableMap<string, number>({
      active_month: 0,
    }),
  }),
  version: '0.0.0',

  pleroma: ImmutableMap<string, any>({
    metadata: ImmutableMap<string, any>({
      account_activation_required: false,
      birthday_min_age: 0,
      birthday_required: false,
      features: ImmutableList(),
      federation: ImmutableMap<string, any>({
        enabled: true,
        exclusions: false,
      }),
      description_limit: 1500,
    }),
    stats: ImmutableMap(),
  }),

  feature_quote: false,
  fedibird_capabilities: ImmutableList(),

  login_message: '',
});

// Build Mastodon configuration from Pleroma instance
const pleromaToMastodonConfig = (instance: ImmutableMap<string, any>) => {
  return ImmutableMap({
    statuses: ImmutableMap({
      max_characters: instance.get('max_toot_chars'),
    }),
    polls: ImmutableMap({
      max_options: instance.getIn(['poll_limits', 'max_options']),
      max_characters_per_option: instance.getIn(['poll_limits', 'max_option_chars']),
      min_expiration: instance.getIn(['poll_limits', 'min_expiration']),
      max_expiration: instance.getIn(['poll_limits', 'max_expiration']),
    }),
  });
};

// Get the software's default attachment limit
const getAttachmentLimit = (software: string | null) => software === PLEROMA ? Infinity : 4;

// Normalize version
const normalizeVersion = (instance: ImmutableMap<string, any>) => {
  return instance.update('version', '0.0.0', version => {
    // Handle Mastodon release candidates
    if (new RegExp(/[0-9\.]+rc[0-9]+/g).test(version)) {
      return version.split('rc').join('-rc');
    } else {
      return version;
    }
  });
};

/** Rename Akkoma to Pleroma+akkoma */
const fixAkkoma = (instance: ImmutableMap<string, any>) => {
  const version: string = instance.get('version', '');

  if (version.includes('Akkoma')) {
    return instance.set('version', '2.7.2 (compatible; Pleroma 2.4.50+akkoma)');
  } else {
    return instance;
  }
};

/** Set Takahē version to a Pleroma-like string */
const fixTakahe = (instance: ImmutableMap<string, any>) => {
  const version: string = instance.get('version', '');

  if (version.startsWith('takahe/')) {
    return instance.set('version', `0.0.0 (compatible; Takahe ${version.slice(7)})`);
  } else {
    return instance;
  }
};

/** Convert /api/v1/instance format to v2 */
const fixInstanceV1 = (instance: ImmutableMap<string, any>) => {
  instance.setIn(['configuration', 'urls', 'streaming'], instance.getIn(['urls', 'streaming_api'], ''));

  instance.set('contact', ImmutableMap({
    account: instance.get('contact_account'),
    email: instance.get('email'),
  }));

  instance.set('description', instance.get('short_description') || instance.get('description'));

  instance.set('registrations', ImmutableMap({
    approval_required: instance.get('approval_required'),
    enabled: instance.get('registrations'),
    message: '',
  }));

  instance.set('thumbnail', ImmutableMap({
    url: instance.get('thumbnail', ''),
  }));

  if (instance.has('pleroma')) {
    instance.setIn(['pleroma', 'metadata', 'description_limit'], instance.get('description_limit'));
  }
};

// Normalize instance (Pleroma, Mastodon, etc.) to Mastodon's format
export const normalizeInstance = (instance: Record<string, any>) => {
  return InstanceRecord(
    ImmutableMap(fromJS(instance)).withMutations((instance: ImmutableMap<string, any>) => {
      const version = instance.has('domain') ? 'v2' : 'v1';

      if (version === 'v1') fixInstanceV1(instance);

      const { software } = parseVersion(instance.get('version'));
      const mastodonConfig = pleromaToMastodonConfig(instance);

      // Merge configuration
      instance.update('configuration', ImmutableMap(), configuration => (
        configuration.mergeDeepWith(mergeDefined, mastodonConfig)
      ));

      // If max attachments isn't set, check the backend software
      instance.updateIn(['configuration', 'statuses', 'max_media_attachments'], value => {
        return isNumber(value) ? value : getAttachmentLimit(software);
      });

      // Urls can't be null, fix for Friendica
      if (instance.get('urls') === null) instance.delete('urls');

      // Normalize version
      normalizeVersion(instance);
      fixTakahe(instance);
      fixAkkoma(instance);

      // Merge defaults
      instance.mergeDeepWith(mergeDefined, InstanceRecord());
    }),
  );
};
