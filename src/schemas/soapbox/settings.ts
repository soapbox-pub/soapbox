import { z } from 'zod';

import { locales } from 'soapbox/messages';

import { coerceObject } from '../utils';

const skinToneSchema = z.union([
  z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.literal(6),
]);

const settingsSchema = z.object({
  onboarded: z.boolean().catch(false),
  skinTone: skinToneSchema.catch(1),
  reduceMotion: z.boolean().catch(false),
  underlineLinks: z.boolean().catch(false),
  autoPlayGif: z.boolean().catch(true),
  displayMedia: z.enum(['default', 'hide_all', 'show_all']).catch('default'),
  preserveSpoilers: z.boolean().catch(false),
  unfollowModal: z.boolean().catch(false),
  boostModal: z.boolean().catch(false),
  deleteModal: z.boolean().catch(true),
  missingDescriptionModal: z.boolean().catch(false),
  defaultPrivacy: z.enum(['public', 'unlisted', 'private', 'direct']).catch('public'),
  defaultContentType: z.enum(['text/plain', 'text/markdown']).catch('text/plain'),
  themeMode: z.enum(['system', 'light', 'dark', 'black']).catch('system'),
  locale: z.string().catch(navigator.language).pipe(z.enum(locales)).catch('en'),
  showExplanationBox: z.boolean().catch(true),
  explanationBox: z.boolean().catch(true),
  autoloadTimelines: z.boolean().catch(true),
  autoloadMore: z.boolean().catch(true),
  systemFont: z.boolean().catch(false),
  demetricator: z.boolean().catch(false),
  isDeveloper: z.boolean().catch(false),
  demo: z.boolean().catch(false),
  chats: coerceObject({
    mainWindow: z.enum(['minimized', 'open']).catch('minimized'),
    sound: z.boolean().catch(true),
  }),
  home: coerceObject({
    shows: coerceObject({
      reblog: z.boolean().catch(true),
      reply: z.boolean().catch(true),
    }),
  }),
  account_timeline: coerceObject({
    shows: coerceObject({
      pinned: z.boolean().catch(true),
    }),
  }),
  remote_timeline: coerceObject({
    pinnedHosts: z.string().array().catch([]),
  }),
  public: coerceObject({
    other: coerceObject({
      onlyMedia: z.boolean().catch(false),
    }),
  }),
  community: coerceObject({
    other: coerceObject({
      onlyMedia: z.boolean().catch(false),
    }),
  }),
  remote: coerceObject({
    other: coerceObject({
      onlyMedia: z.boolean().catch(false),
    }),
  }),
  notifications: coerceObject({
    quickFilter: coerceObject({
      active: z.string().catch('all'),
      advanced: z.boolean().catch(false),
      show: z.boolean().catch(true),
    }),
  }),
});

type Settings = z.infer<typeof settingsSchema>;

export { settingsSchema, type Settings };
