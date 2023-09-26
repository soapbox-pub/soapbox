/* eslint sort-keys: "error" */
import z from 'zod';

import { accountSchema } from './account';
import { mrfSimpleSchema } from './pleroma';
import { ruleSchema } from './rule';
import { coerceObject, filteredArray, mimeSchema } from './utils';

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
    max_characters_per_option: z.number().catch(25),
    max_expiration: z.number().catch(2629746),
    max_options: z.number().catch(4),
    min_expiration: z.number().catch(300),
  }),
  statuses: coerceObject({
    max_characters: z.number().optional().catch(undefined),
    max_media_attachments: z.number().catch(4),
  }),
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

const statsSchema = coerceObject({
  domain_count: z.number().catch(0),
  status_count: z.number().catch(0),
  user_count: z.number().catch(0),
});

const urlsSchema = coerceObject({
  streaming_api: z.string().url().optional().catch(undefined),
});

const usageSchema = coerceObject({
  users: coerceObject({
    active_month: z.number().catch(0),
  }),
});

const instanceSchema = coerceObject({
  approval_required: z.boolean().catch(false),
  configuration: configurationSchema,
  contact_account: accountSchema.optional().catch(undefined),
  description: z.string().catch(''),
  description_limit: z.number().catch(1500),
  email: z.string().email().catch(''),
  feature_quote: z.boolean().catch(false),
  fedibird_capabilities: z.array(z.string()).catch([]),
  languages: z.string().array().catch([]),
  max_toot_chars: z.number().optional().catch(undefined),
  nostr: nostrSchema.optional().catch(undefined),
  pleroma: pleromaSchema,
  registrations: z.boolean().catch(false),
  rules: filteredArray(ruleSchema),
  short_description: z.string().catch(''),
  stats: statsSchema,
  thumbnail: z.string().catch(''),
  title: z.string().catch(''),
  urls: urlsSchema,
  usage: usageSchema,
  version: z.string().catch(''),
}).transform(({ max_toot_chars, ...instance }) => {
  const { configuration } = instance;

  const statuses = {
    ...configuration.statuses,
    max_characters: configuration.statuses.max_characters ?? max_toot_chars ?? 500,
  };

  return {
    ...instance,
    configuration: {
      ...instance.configuration,
      statuses,
    },
  };
});

type Instance = z.infer<typeof instanceSchema>;

export { instanceSchema, Instance };
