import z from 'zod';

const instanceSchema = z.object({
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
      video_size_limit: z.number().optional(),
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
    // translation
    urls: z.record(z.string()).default({}),
  }).default({}),
  description: z.string().default(''),
  registrations: z.object({
    approval_required: z.boolean().default(false),
    enabled: z.boolean().default(false),
    message: z.string().default(''),
  }).default({}),
  rules: z.any(),
  stats: z.any(),
  title: z.string().default(''),
  thumbnail: z.any(),
  version: z.string().default(''),

  pleroma: z.any(),

  feature_quote: z.boolean().default(false),

  login_message: z.string().default(''),
});

type Instance = z.infer<typeof instanceSchema>;

export { instanceSchema, Instance };
