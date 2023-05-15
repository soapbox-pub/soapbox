import z from 'zod';

const instanceV1Schema = z.object({
  approval_required: z.boolean().default(false),
  contact_account: z.any().optional(),
  configuration: z.object({
    chats: z.object({
      max_characters: z.number().default(5000),
      max_media_attachments: z.number().default(1),
    }).default({}),
    groups: z.object({
      max_characters_name: z.number().default(50),
      max_characters_description: z.number().default(160),
    }).default({}),
    media_attachments: z.object({
      supported_mime_types: z.array(z.string()).optional(),
      image_size_limit: z.number().optional(),
      image_matrix_limit: z.number().optional(),
      video_size_limit: z.number().optional(),
      video_frame_rate_limit: z.number().optional(),
      video_matrix_limit: z.number().optional(),
    }).optional(),
    polls: z.object({
      max_options: z.number().default(4),
      max_characters_per_option: z.number().default(25),
      min_expiration: z.number().default(300),
      max_expiration: z.number().default(2629746),
    }).default({}),
    statuses: z.object({
      max_characters: z.number().default(500),
      max_media_attachments: z.number().default(4),
    }).default({}),
  }).default({}),
  description: z.string().default(''),
  domain: z.string().default(''),
  email: z.string().default(''),
  languages: z.array(z.string()).default([]),
  registrations: z.boolean().default(false),
  rules: z.any(),
  short_description: z.string().default(''),
  stats: z.any(),
  title: z.string().default(''),
  thumbnail: z.string().default(''),
  urls: z.object({
    streaming_api: z.string().default(''),
  }).optional(),
  usage: z.object({
    users: z.object({
      active_month: z.number().default(0),
    }).default({}),
  }).default({}),
  version: z.string().default(''),

  description_limit: z.number().default(1500),
  pleroma: z.object({
    metadata: z.object({
      account_activation_required: z.boolean().default(false),
      birthday_min_age: z.number().default(0),
      birthday_required: z.boolean().default(false),
      features: z.array(z.string()).default([]),
      federation: z.object({
        enabled: z.boolean().default(false),
        mrf_simple: z.any(),
      }).default({}),
      fields_limits: z.any(),
      translation: z.object({
        allow_unauthenticated: z.boolean().default(false),
        allow_remote: z.boolean().default(true),
        source_languages: z.array(z.string()).optional(),
        target_languages: z.array(z.string()).optional(),
      }).optional(),
    }).default({}),
    oauth_consumer_strategies: z.array(z.string()).default([]),
    stats: z.object({
      mau: z.number().optional(),
    }).default({}),
    vapid_public_key: z.string().default(''),
  }).default({}),

  feature_quote: z.boolean().default(false),
  fedibird_capabilities: z.array(z.string()).default([]),

  login_message: z.string().default(''),
});

type InstanceV1 = z.infer<typeof instanceV1Schema>;

export { instanceV1Schema, InstanceV1 };
