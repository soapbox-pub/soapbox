import { defaultsDeep, update } from 'lodash';

import { parseVersion, PLEROMA } from 'soapbox/utils/features';
import { isNumber } from 'soapbox/utils/numbers';

// Use Mastodon defaults
const baseInstance: Partial<Instance> = {
  title: '',
  short_description: '',
  description_limit: 1500,
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
  uri: '',
  version: '0.0.0',
};

// Build Mastodon configuration from Pleroma instance
const pleromaToMastodonConfig = (instance: Immutable<{[key: string]: any}>): Immutable<{[key: string]: any}> => {
  return {
    statuses: {
      max_characters: instance.max_toot_chars,
    },
    polls: {
      max_options: instance.poll_limits?.max_options,
      max_characters_per_option: instance.poll_limits?.max_option_chars,
      min_expiration: instance.poll_limits?.min_expiration,
      max_expiration: instance.poll_limits?.max_expiration,
    },
  };
};

// Get the software's default attachment limit
const getAttachmentLimit = (software: string): number => software === PLEROMA ? Infinity : 4;

// Normalize instance (Pleroma, Mastodon, etc.) to Mastodon's format
export const normalizeInstance = (instance: {[key: string]: any}): {[key: string]: any} => {
  const { software } = parseVersion(instance.version);
  const mastodonConfig = pleromaToMastodonConfig(instance);

  // Merge configuration
  instance.configuration = instance.configuration || {};
  defaultsDeep(instance.configuration, mastodonConfig);

  // If max attachments isn't set, check the backend software
  update(instance, 'configuration.statuses.max_media_attachments', value => {
    return isNumber(value) ? value : getAttachmentLimit(software);
  });

  // Merge defaults & cleanup
  defaultsDeep(instance, baseInstance);

  delete instance.max_toot_chars;
  delete instance.poll_limits;

  return instance;
};
