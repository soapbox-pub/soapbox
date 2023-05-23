import escapeTextContentForBrowser from 'escape-html';
import z from 'zod';

import emojify from 'soapbox/features/emoji';
import { unescapeHTML } from 'soapbox/utils/html';

import { customEmojiSchema } from './custom-emoji';
import { contentSchema, filteredArray, makeCustomEmojiMap } from './utils';

const avatarMissing = require('assets/images/avatar-missing.png');
const headerMissing = require('assets/images/header-missing.png');

const birthdaySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const fieldSchema = z.object({
  name: z.string(),
  value: z.string(),
  verified_at: z.string().datetime().nullable().catch(null),
});

const baseAccountSchema = z.object({
  acct: z.string().catch(''),
  avatar: z.string().catch(avatarMissing),
  avatar_static: z.string().url().optional().catch(undefined),
  bot: z.boolean().catch(false),
  created_at: z.string().datetime().catch(new Date().toUTCString()),
  discoverable: z.boolean().catch(false),
  display_name: z.string().catch(''),
  emojis: filteredArray(customEmojiSchema),
  favicon: z.string().catch(''),
  fields: filteredArray(fieldSchema),
  followers_count: z.number().catch(0),
  following_count: z.number().catch(0),
  fqn: z.string().optional().catch(undefined),
  header: z.string().url().catch(headerMissing),
  header_static: z.string().url().optional().catch(undefined),
  id: z.string(),
  last_status_at: z.string().datetime().optional().catch(undefined),
  location: z.string().optional().catch(undefined),
  locked: z.boolean().catch(false),
  moved: z.literal(null).catch(null),
  mute_expires_at: z.union([
    z.string(),
    z.null(),
  ]).catch(null),
  note: contentSchema,
  /** Fedibird extra settings. */
  other_settings: z.object({
    birthday: birthdaySchema.nullish().catch(undefined),
    location: z.string().optional().catch(undefined),
  }).optional().catch(undefined),
  pleroma: z.object({
    accepts_chat_messages: z.boolean().catch(false),
    birthday: birthdaySchema.nullish().catch(undefined),
    deactivated: z.boolean().catch(false),
    hide_favorites: z.boolean().catch(false),
    is_admin: z.boolean().catch(false),
    is_moderator: z.boolean().catch(false),
    is_suggested: z.boolean().catch(false),
    favicon: z.string().url().optional().catch(undefined),
    location: z.string().optional().catch(undefined),
    tags: z.array(z.string()).catch([]),
  }).optional().catch(undefined),
  source: z.object({
    chats_onboarded: z.boolean().catch(true),
    pleroma: z.object({
      discoverable: z.boolean().catch(true),
    }).optional().catch(undefined),
  }).optional().catch(undefined),
  statuses_count: z.number().catch(0),
  suspended: z.boolean().catch(false),
  uri: z.string().url().catch(''),
  url: z.string().url().catch(''),
  username: z.string().catch(''),
  verified: z.boolean().catch(false),
  website: z.string().catch(''),
});

type BaseAccount = z.infer<typeof baseAccountSchema>;
type TransformableAccount = Omit<BaseAccount, 'moved'>;

/** Add internal fields to the account. */
const transformAccount = <T extends TransformableAccount>({ pleroma, other_settings, fields, ...account }: T) => {
  const customEmojiMap = makeCustomEmojiMap(account.emojis);

  const newFields = fields.map((field) => ({
    ...field,
    name_emojified: emojify(escapeTextContentForBrowser(field.name), customEmojiMap),
    value_emojified: emojify(field.value, customEmojiMap),
    value_plain: unescapeHTML(field.value),
  }));

  return {
    ...account,
    admin: pleroma?.is_admin || false,
    avatar_static: account.avatar_static || account.avatar,
    discoverable: account.discoverable || account.source?.pleroma?.discoverable || false,
    display_name: account.display_name.trim().length === 0 ? account.username : account.display_name,
    display_name_html: emojify(escapeTextContentForBrowser(account.display_name), customEmojiMap),
    fields: newFields,
    fqn: account.fqn || (account.acct.includes('@') ? account.acct : `${account.acct}@${new URL(account.url).host}`),
    header_static: account.header_static || account.header,
    moderator: pleroma?.is_moderator || false,
    location: account.location || pleroma?.location || other_settings?.location || '',
    note_emojified: emojify(account.note, customEmojiMap),
    pleroma: {
      accepts_chat_messages: pleroma?.accepts_chat_messages || false,
      birthday: pleroma?.birthday || other_settings?.birthday,
      hide_favorites: pleroma?.hide_favorites || false,
      is_suggested: pleroma?.is_suggested || false,
      tags: pleroma?.tags || [],
    },
    suspended: account.suspended || pleroma?.deactivated || false,
    verified: account.verified || pleroma?.tags.includes('verified') || false,
  };
};

const accountSchema = baseAccountSchema.extend({
  moved: baseAccountSchema.transform(transformAccount).nullable().catch(null),
}).transform(transformAccount);

type Account = z.infer<typeof accountSchema>;

export { accountSchema, type Account };