import { z } from 'zod';

import { locales } from 'soapbox/locales/messages';

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
  expandSpoilers: z.boolean().catch(false),
  unfollowModal: z.boolean().catch(false),
  boostModal: z.boolean().catch(false),
  deleteModal: z.boolean().catch(true),
  missingDescriptionModal: z.boolean().catch(false),
  defaultPrivacy: z.enum(['public', 'unlisted', 'private', 'direct']).catch('public'),
  defaultContentType: z.enum(['text/plain', 'text/markdown']).catch('text/plain'),
  themeMode: z.enum(['system', 'light', 'dark']).catch('system'),
  locale: z.string().catch(navigator.language).pipe(z.enum(locales)).catch('en'),
  showExplanationBox: z.boolean().catch(true),
  explanationBox: z.boolean().catch(true),
  autoloadTimelines: z.boolean().catch(true),
  autoloadMore: z.boolean().catch(true),
  systemFont: z.boolean().catch(false),
  demetricator: z.boolean().catch(false),
  isDeveloper: z.boolean().catch(false),
});

type Settings = z.infer<typeof settingsSchema>;

export { settingsSchema, type Settings };