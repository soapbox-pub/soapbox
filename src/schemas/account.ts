import { NSchema as n } from '@nostrify/nostrify';
import escapeTextContentForBrowser from 'escape-html';
import DOMPurify from 'isomorphic-dompurify';
import z from 'zod';

import emojify from 'soapbox/features/emoji';
import { unescapeHTML } from 'soapbox/utils/html';

import { customEmojiSchema } from './custom-emoji';
import { relationshipSchema } from './relationship';
import { coerceObject, contentSchema, filteredArray, makeCustomEmojiMap } from './utils';

import type { Resolve } from 'soapbox/utils/types';

const avatarMissing = require('soapbox/assets/images/avatar-missing.png');
const headerMissing = require('soapbox/assets/images/header-missing.png');

const birthdaySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const hexSchema = z.string().regex(/^#[a-f0-9]{6}$/i);

const fieldSchema = z.object({
  name: z.string(),
  value: z.string(),
  verified_at: z.string().datetime().nullable().catch(null),
});

const roleSchema = z.object({
  id: z.string().catch(''),
  name: z.string().catch(''),
  color: hexSchema.catch(''),
  highlighted: z.boolean().catch(true),
});

const baseAccountSchema = z.object({
  acct: z.string().catch(''),
  avatar: z.string().catch(avatarMissing),
  avatar_static: z.string().url().optional().catch(undefined),
  bot: z.boolean().catch(false),
  created_at: z.string().datetime().catch(new Date().toUTCString()),
  discoverable: z.boolean().catch(false),
  display_name: z.string().catch(''),
  ditto: coerceObject({
    accepts_zaps: z.boolean().catch(false),
    is_registered: z.boolean().catch(false),
    external_url: z.string().optional().catch(undefined),
  }),
  domain: z.string().optional().catch(undefined),
  emojis: filteredArray(customEmojiSchema),
  fields: filteredArray(fieldSchema),
  followers_count: z.number().catch(0),
  following_count: z.number().catch(0),
  fqn: z.string().optional().catch(undefined),
  header: z.string().url().catch(headerMissing),
  header_static: z.string().url().optional().catch(undefined),
  id: z.string(),
  last_status_at: z.string().datetime().optional().catch(undefined),
  local: z.boolean().catch(false),
  location: z.string().optional().catch(undefined),
  locked: z.boolean().catch(false),
  moved: z.literal(null).catch(null),
  mute_expires_at: z.union([
    z.string(),
    z.null(),
  ]).catch(null),
  nostr: coerceObject({
    pubkey: n.id().optional().catch(undefined),
    lud16: z.string().email().optional().catch(undefined),
  }),
  note: contentSchema,
  /** Fedibird extra settings. */
  other_settings: z.object({
    birthday: birthdaySchema.nullish().catch(undefined),
    location: z.string().optional().catch(undefined),
  }).optional().catch(undefined),
  pleroma: z.object({
    accepts_chat_messages: z.boolean().catch(false),
    accepts_email_list: z.boolean().catch(false),
    also_known_as: z.array(z.string().url()).catch([]),
    ap_id: z.string().url().optional().catch(undefined),
    birthday: birthdaySchema.nullish().catch(undefined),
    deactivated: z.boolean().catch(false),
    favicon: z.string().url().optional().catch(undefined),
    hide_favorites: z.boolean().catch(false),
    hide_followers: z.boolean().catch(false),
    hide_followers_count: z.boolean().catch(false),
    hide_follows: z.boolean().catch(false),
    hide_follows_count: z.boolean().catch(false),
    is_admin: z.boolean().catch(false),
    is_local: z.boolean().optional().catch(undefined),
    is_moderator: z.boolean().catch(false),
    is_suggested: z.boolean().catch(false),
    location: z.string().optional().catch(undefined),
    notification_settings: z.object({
      block_from_strangers: z.boolean().catch(false),
    }).optional().catch(undefined),
    relationship: relationshipSchema.optional().catch(undefined),
    tags: z.array(z.string()).catch([]),
  }).optional().catch(undefined),
  roles: filteredArray(roleSchema),
  source: z.object({
    approved: z.boolean().catch(true),
    chats_onboarded: z.boolean().catch(true),
    fields: filteredArray(fieldSchema),
    note: z.string().catch(''),
    pleroma: z.object({
      discoverable: z.boolean().catch(true),
    }).optional().catch(undefined),
    sms_verified: z.boolean().catch(false),
    nostr: z.object({
      nip05: z.string().optional().catch(undefined),
    }).optional().catch(undefined),
    ditto: coerceObject({
      captcha_solved: z.boolean().catch(true),
    }),
  }).optional().catch(undefined),
  statuses_count: z.number().catch(0),
  suspended: z.boolean().catch(false),
  uri: z.string().url().catch(''),
  url: z.string().url(),
  username: z.string().catch(''),
  verified: z.boolean().catch(false),
  website: z.string().catch(''),
});

type BaseAccount = z.infer<typeof baseAccountSchema>;
type TransformableAccount = Omit<BaseAccount, 'moved'>;

const getDomain = (url: string) => {
  try {
    return new URL(url).host;
  } catch (e) {
    return '';
  }
};

const filterBadges = (tags?: string[]) =>
  tags?.filter(tag => tag.startsWith('badge:')).map(tag => roleSchema.parse({ id: tag, name: tag.replace(/^badge:/, '') }));

/** Add internal fields to the account. */
const transformAccount = <T extends TransformableAccount>({ pleroma, other_settings, fields, ...account }: T) => {
  const customEmojiMap = makeCustomEmojiMap(account.emojis);

  const newFields = fields.map((field) => ({
    ...field,
    name_emojified: DOMPurify.sanitize(emojify(escapeTextContentForBrowser(field.name), customEmojiMap), { USE_PROFILES: { html: true } }),
    value_emojified: emojify(field.value, customEmojiMap),
    value_plain: unescapeHTML(field.value),
  }));

  const displayName = account.display_name.trim().length === 0 ? account.username : account.display_name;
  const domain = account.domain ?? getDomain(account.url || account.uri);

  if (pleroma) {
    pleroma.birthday = pleroma.birthday || other_settings?.birthday;
  }

  return {
    ...account,
    admin: pleroma?.is_admin || false,
    avatar_static: account.avatar_static || account.avatar,
    discoverable: account.discoverable || account.source?.pleroma?.discoverable || false,
    display_name: displayName,
    display_name_html: DOMPurify.sanitize(emojify(escapeTextContentForBrowser(displayName), customEmojiMap), { USE_PROFILES: { html: true } }),
    domain,
    fields: newFields,
    fqn: account.fqn || (account.acct.includes('@') ? account.acct : `${account.acct}@${domain}`),
    header_static: account.header_static || account.header,
    moderator: pleroma?.is_moderator || false,
    local: pleroma?.is_local !== undefined ? pleroma.is_local : account.acct.split('@')[1] === undefined,
    location: account.location || pleroma?.location || other_settings?.location || '',
    note_emojified: DOMPurify.sanitize(emojify(account.note, customEmojiMap), { USE_PROFILES: { html: true } }),
    pleroma: (() => {
      if (!pleroma) return undefined;
      const { relationship, ...rest } = pleroma;
      return rest;
    })(),
    roles: account.roles.length ? account.roles : filterBadges(pleroma?.tags),
    relationship: pleroma?.relationship,
    staff: pleroma?.is_admin || pleroma?.is_moderator || false,
    suspended: account.suspended || pleroma?.deactivated || false,
    verified: account.verified || pleroma?.tags.includes('verified') || false,
  };
};

const accountSchema = baseAccountSchema.extend({
  moved: baseAccountSchema.transform(transformAccount).nullable().catch(null),
}).transform(transformAccount);

type Account = Resolve<z.infer<typeof accountSchema>>;

export { accountSchema, type Account };
