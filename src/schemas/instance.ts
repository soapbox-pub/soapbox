/* eslint sort-keys: "error" */
import z from 'zod';

import { PLEROMA, parseVersion } from 'soapbox/utils/features';

import { accountSchema } from './account';
import { mrfSimpleSchema } from './pleroma';
import { ruleSchema } from './rule';
import { coerceObject, filteredArray, mimeSchema } from './utils';

const getAttachmentLimit = (software: string | null) => software === PLEROMA ? Infinity : 4;

const fixVersion = (version: string) => {
  // Handle Mastodon release candidates
  if (new RegExp(/[0-9.]+rc[0-9]+/g).test(version)) {
    version = version.split('rc').join('-rc');
  }

  // Rename Akkoma to Pleroma+akkoma
  if (version.includes('Akkoma')) {
    version = '2.7.2 (compatible; Pleroma 2.4.50+akkoma)';
  }

  // Set Takahē version to a Pleroma-like string
  if (version.startsWith('takahe/')) {
    version = `0.0.0 (compatible; Takahe ${version.slice(7)})`;
  }

  return version;
};

const configurationSchema = coerceObject({
  chats: coerceObject({
    max_characters: z.number().catch(5000),
    max_media_attachments: z.number().catch(1),
  }),
  groups: coerceObject({
    max_characters_description: z.number().catch(160),
    max_characters_name: z.number().catch(50),
  }),
  media_attachments: coerceObject({
    image_matrix_limit: z.number().optional().catch(undefined),
    image_size_limit: z.number().optional().catch(undefined),
    supported_mime_types: mimeSchema.array().optional().catch(undefined),
    video_duration_limit: z.number().optional().catch(undefined),
    video_frame_rate_limit: z.number().optional().catch(undefined),
    video_matrix_limit: z.number().optional().catch(undefined),
    video_size_limit: z.number().optional().catch(undefined),
  }),
  polls: coerceObject({
    max_characters_per_option: z.number().optional().catch(undefined),
    max_expiration: z.number().optional().catch(undefined),
    max_options: z.number().optional().catch(undefined),
    min_expiration: z.number().optional().catch(undefined),
  }),
  reactions: coerceObject({
    max_reactions: z.number().catch(0),
  }),
  statuses: coerceObject({
    characters_reserved_per_url: z.number().optional().catch(undefined),
    max_characters: z.number().optional().catch(undefined),
    max_media_attachments: z.number().optional().catch(undefined),

  }),
  translation: coerceObject({
    enabled: z.boolean().catch(false),
  }),
  urls: coerceObject({
    streaming: z.string().url().optional().catch(undefined),
  }),
});

const contactSchema = coerceObject({
  contact_account: accountSchema.optional().catch(undefined),
  email: z.string().email().catch(''),
});

const nostrSchema = coerceObject({
  pubkey: z.string(),
  relay: z.string().url(),
});

const pleromaSchema = coerceObject({
  metadata: coerceObject({
    account_activation_required: z.boolean().catch(false),
    birthday_min_age: z.number().catch(0),
    birthday_required: z.boolean().catch(false),
    description_limit: z.number().catch(1500),
    features: z.string().array().catch([]),
    federation: coerceObject({
      enabled: z.boolean().catch(true), // Assume true unless explicitly false
      mrf_policies: z.string().array().optional().catch(undefined),
      mrf_simple: mrfSimpleSchema,
    }),
    fields_limits: coerceObject({
      max_fields: z.number().nonnegative().catch(4),
      name_length: z.number().nonnegative().catch(255),
      value_length: z.number().nonnegative().catch(2047),
    }),
    migration_cooldown_period: z.number().optional().catch(undefined),
    multitenancy: coerceObject({
      domains: z
        .array(
          z.object({
            domain: z.coerce.string(),
            id: z.string(),
            public: z.boolean().catch(false),
          }),
        )
        .optional(),
      enabled: z.boolean().catch(false),
    }),
    restrict_unauthenticated: coerceObject({
      activities: coerceObject({
        local: z.boolean().catch(false),
        remote: z.boolean().catch(false),
      }),
      profiles: coerceObject({
        local: z.boolean().catch(false),
        remote: z.boolean().catch(false),
      }),
      timelines: coerceObject({
        federated: z.boolean().catch(false),
        local: z.boolean().catch(false),
      }),
    }),
    translation: coerceObject({
      allow_remote: z.boolean().catch(true),
      allow_unauthenticated: z.boolean().catch(false),
      source_languages: z.string().array().optional().catch(undefined),
      target_languages: z.string().array().optional().catch(undefined),
    }),
  }),
  oauth_consumer_strategies: z.string().array().catch([]),
  stats: coerceObject({
    mau: z.number().optional().catch(undefined),
  }),
  vapid_public_key: z.string().catch(''),
});

const pleromaPollLimitsSchema = coerceObject({
  max_expiration: z.number().optional().catch(undefined),
  max_option_chars: z.number().optional().catch(undefined),
  max_options: z.number().optional().catch(undefined),
  min_expiration: z.number().optional().catch(undefined),
});

const registrations = coerceObject({
  approval_required: z.boolean().catch(false),
  enabled: z.boolean().catch(false),
  message: z.string().optional().catch(undefined),
});

const statsSchema = coerceObject({
  domain_count: z.number().optional().catch(undefined),
  status_count: z.number().optional().catch(undefined),
  user_count: z.number().optional().catch(undefined),
});

const thumbnailSchema = coerceObject({
  url: z.string().catch(''),
});

const usageSchema = coerceObject({
  users: coerceObject({
    active_month: z.number().catch(0),
  }),
});

const instanceV1Schema = coerceObject({
  approval_required: z.boolean().catch(false),
  configuration: configurationSchema,
  contact_account: accountSchema.optional().catch(undefined),
  description: z.string().catch(''),
  description_limit: z.number().catch(1500),
  email: z.string().email().catch(''),
  feature_quote: z.boolean().catch(false),
  fedibird_capabilities: z.array(z.string()).catch([]),
  languages: z.string().array().catch([]),
  max_media_attachments: z.number().optional().catch(undefined),
  max_toot_chars: z.number().optional().catch(undefined),
  nostr: nostrSchema.optional().catch(undefined),
  pleroma: pleromaSchema,
  poll_limits: pleromaPollLimitsSchema,
  registrations: z.boolean().catch(false),
  rules: filteredArray(ruleSchema),
  short_description: z.string().catch(''),
  stats: statsSchema,
  thumbnail: z.string().catch(''),
  title: z.string().catch(''),
  uri: z.string().catch(''),
  urls: coerceObject({
    streaming_api: z.string().url().optional().catch(undefined),
  }),
  usage: usageSchema,
  version: z.string().catch('0.0.0'),
});

const instanceSchema = z.preprocess((data: any) => {
  if (data.domain) return data;

  const {
    approval_required,
    configuration,
    contact_account,
    description,
    description_limit,
    email,
    max_media_attachments,
    max_toot_chars,
    poll_limits,
    pleroma,
    registrations,
    short_description,
    thumbnail,
    uri,
    urls,
    ...instance
  } = instanceV1Schema.parse(data);

  const { software } = parseVersion(instance.version);

  return {
    ...instance,
    configuration: {
      ...configuration,
      polls: {
        ...configuration.polls,
        max_characters_per_option: configuration.polls.max_characters_per_option ?? poll_limits.max_option_chars ?? 25,
        max_expiration: configuration.polls.max_expiration ?? poll_limits.max_expiration ?? 2629746,
        max_options: configuration.polls.max_options ?? poll_limits.max_options ?? 4,
        min_expiration: configuration.polls.min_expiration ?? poll_limits.min_expiration ?? 300,
      },
      statuses: {
        ...configuration.statuses,
        max_characters: configuration.statuses.max_characters ?? max_toot_chars ?? 500,
        max_media_attachments: configuration.statuses.max_media_attachments ?? max_media_attachments ?? getAttachmentLimit(software),
      },
      urls: {
        streaming: urls.streaming_api,
      },
    },
    contact: {
      account: contact_account,
      email: email,
    },
    description: short_description || description,
    domain: uri,
    pleroma: {
      ...pleroma,
      metadata: {
        ...pleroma.metadata,
        description_limit,
      },
    },
    registrations: {
      approval_required: approval_required,
      enabled: registrations,
    },
    thumbnail: { url: thumbnail },
  };
}, coerceObject({
  configuration: configurationSchema,
  contact: contactSchema,
  description: z.string().catch(''),
  domain: z.string().catch(''),
  feature_quote: z.boolean().catch(false),
  fedibird_capabilities: z.array(z.string()).catch([]),
  languages: z.string().array().catch([]),
  nostr: nostrSchema.optional().catch(undefined),
  pleroma: pleromaSchema,
  registrations: registrations,
  rules: filteredArray(ruleSchema),
  stats: statsSchema,
  thumbnail: thumbnailSchema,
  title: z.string().catch(''),
  usage: usageSchema,
  version: z.string().catch('0.0.0'),
}).transform(({ configuration, ...instance }) => {
  const version = fixVersion(instance.version);

  const polls = {
    ...configuration.polls,
    max_characters_per_option: configuration.polls.max_characters_per_option ?? 25,
    max_expiration: configuration.polls.max_expiration ?? 2629746,
    max_options: configuration.polls.max_options ?? 4,
    min_expiration: configuration.polls.min_expiration ?? 300,
  };

  const statuses = {
    ...configuration.statuses,
    max_characters: configuration.statuses.max_characters ?? 500,
    max_media_attachments: configuration.statuses.max_media_attachments ?? 4,
  };

  return {
    ...instance,
    configuration: {
      ...configuration,
      polls,
      statuses,
    },
    version,
  };
}));

type Instance = z.infer<typeof instanceSchema>;
type InstanceV1 = z.infer<typeof instanceV1Schema>;

export { instanceSchema, Instance, instanceV1Schema, InstanceV1 };
