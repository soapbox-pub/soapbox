/* eslint sort-keys: "error" */
import z from 'zod';

import { accountSchema } from './account';
import { screenshotsSchema } from './manifest';
import { mrfSimpleSchema } from './pleroma';
import { ruleSchema } from './rule';
import { coerceObject, filteredArray, mimeSchema } from './utils';

const versionSchema = z.string().catch('0.0.0').transform((version) => {
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
});

const configurationSchema = coerceObject({
  accounts: coerceObject({
    max_featured_tags: z.number().catch(Infinity),
    max_pinned_statuses: z.number().catch(Infinity),
  }),
  chats: coerceObject({
    max_characters: z.number().catch(Infinity),
    max_media_attachments: z.number().catch(Infinity),
  }),
  groups: coerceObject({
    max_characters_description: z.number().catch(Infinity),
    max_characters_name: z.number().catch(Infinity),
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
    max_characters_per_option: z.number().catch(Infinity),
    max_expiration: z.number().catch(Infinity),
    max_options: z.number().catch(Infinity),
    min_expiration: z.number().catch(Infinity),
  }),
  reactions: coerceObject({
    max_reactions: z.number().catch(0),
  }),
  statuses: coerceObject({
    characters_reserved_per_url: z.number().optional().catch(undefined),
    max_characters: z.number().catch(Infinity),
    max_media_attachments: z.number().catch(Infinity),

  }),
  translation: coerceObject({
    enabled: z.boolean().catch(false),
  }),
  urls: coerceObject({
    streaming: z.string().url().optional().catch(undefined),
  }),
  vapid: coerceObject({
    public_key: z.string().optional().catch(undefined),
  }),
});

const contactSchema = coerceObject({
  account: accountSchema.optional().catch(undefined),
  email: z.string().email().optional().catch(undefined),
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

const registrationsSchema = coerceObject({
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
  blurhash: z.string().optional().catch(undefined),
  url: z.string().url().optional().catch(undefined),
  versions: coerceObject({
    '@1x': z.string().url().optional().catch(undefined),
    '@2x': z.string().url().optional().catch(undefined),
  }),
});

const instanceIconSchema = coerceObject({
  size: z.string().optional().catch(undefined),
  src: z.string().url().optional().catch(undefined),
});

const usageSchema = coerceObject({
  users: coerceObject({
    active_month: z.number().optional().catch(undefined),
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
  languages: filteredArray(z.string()),
  max_media_attachments: z.number().optional().catch(undefined),
  max_toot_chars: z.number().optional().catch(undefined),
  nostr: nostrSchema.optional().catch(undefined),
  pleroma: pleromaSchema,
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
  version: versionSchema,
});

const instanceV2Schema = coerceObject({
  api_versions: z.record(z.string(), z.number()).catch({}),
  configuration: configurationSchema,
  contact: contactSchema,
  description: z.string().catch(''),
  domain: z.string().catch(''),
  icon: filteredArray(instanceIconSchema),
  languages: filteredArray(z.string()),
  nostr: nostrSchema.optional().catch(undefined),
  pleroma: pleromaSchema,
  registrations: registrationsSchema,
  rules: filteredArray(ruleSchema),
  screenshots: screenshotsSchema.catch([]),
  short_description: z.string().catch(''),
  source_url: z.string().url().optional().catch(undefined),
  thumbnail: thumbnailSchema,
  title: z.string().catch(''),
  usage: usageSchema,
  version: versionSchema,
});

function upgradeInstance(v1: InstanceV1): InstanceV2 {
  return {
    api_versions: {},
    configuration: v1.configuration,
    contact: {
      account: v1.contact_account,
      email: v1.email,
    },
    description: v1.short_description, // Shouldn't it be "v1.description" ?
    domain: v1.uri,
    icon: [],
    languages: v1.languages,
    nostr: v1.nostr,
    pleroma: v1.pleroma,
    registrations: {
      approval_required: v1.approval_required,
      enabled: v1.registrations,
    },
    rules: v1.rules,
    screenshots: [],
    short_description: v1.short_description,
    thumbnail: {
      url: v1.thumbnail,
      versions: {
        '@1x': v1.thumbnail,
      },
    },
    title: v1.title,
    usage: {
      users: {},
    },
    version: v1.version,
  };
}

type InstanceV1 = z.infer<typeof instanceV1Schema>;
type InstanceV2 = z.infer<typeof instanceV2Schema>;

export { instanceV1Schema, InstanceV1, instanceV2Schema, InstanceV2, upgradeInstance, thumbnailSchema };
