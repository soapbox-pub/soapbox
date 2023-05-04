import escapeTextContentForBrowser from 'escape-html';
import z from 'zod';

import emojify from 'soapbox/features/emoji';

import { customEmojiSchema } from './custom-emoji';
import { relationshipSchema } from './relationship';
import { contentSchema, filteredArray, makeCustomEmojiMap } from './utils';

const avatarMissing = require('assets/images/avatar-missing.png');
const headerMissing = require('assets/images/header-missing.png');

const accountSchema = z.object({
  accepting_messages: z.boolean().catch(false),
  accepts_chat_messages: z.boolean().catch(false),
  acct: z.string().catch(''),
  avatar: z.string().catch(avatarMissing),
  avatar_static: z.string().catch(''),
  birthday: z.string().catch(''),
  bot: z.boolean().catch(false),
  chats_onboarded: z.boolean().catch(true),
  created_at: z.string().datetime().catch(new Date().toUTCString()),
  discoverable: z.boolean().catch(false),
  display_name: z.string().catch(''),
  emojis: filteredArray(customEmojiSchema),
  favicon: z.string().catch(''),
  fields: z.any(), // TODO
  followers_count: z.number().catch(0),
  following_count: z.number().catch(0),
  fqn: z.string().catch(''),
  header: z.string().catch(headerMissing),
  header_static: z.string().catch(''),
  id: z.string(),
  last_status_at: z.string().catch(''),
  location: z.string().catch(''),
  locked: z.boolean().catch(false),
  moved: z.any(), // TODO
  mute_expires_at: z.union([
    z.string(),
    z.null(),
  ]).catch(null),
  note: contentSchema,
  pleroma: z.any(), // TODO
  source: z.any(), // TODO
  statuses_count: z.number().catch(0),
  uri: z.string().url().catch(''),
  url: z.string().url().catch(''),
  username: z.string().catch(''),
  verified: z.boolean().default(false),
  website: z.string().catch(''),

  /**
   * Internal fields
   */
  display_name_html: z.string().catch(''),
  domain: z.string().catch(''),
  note_emojified: z.string().catch(''),
  relationship: relationshipSchema.nullable().catch(null),

  /**
   * Misc
   */
  other_settings: z.any(),
}).transform((account) => {
  const customEmojiMap = makeCustomEmojiMap(account.emojis);

  // Birthday
  const birthday = account.pleroma?.birthday || account.other_settings?.birthday;
  account.birthday = birthday;

  // Verified
  const verified = account.verified === true || account.pleroma?.tags?.includes('verified');
  account.verified = verified;

  // Location
  const location = account.location
    || account.pleroma?.location
    || account.other_settings?.location;
  account.location = location;

  // Username
  const acct = account.acct || '';
  const username = account.username || '';
  account.username = username || acct.split('@')[0];

  // Display Name
  const displayName = account.display_name || '';
  account.display_name = displayName.trim().length === 0 ? account.username : displayName;
  account.display_name_html = emojify(escapeTextContentForBrowser(displayName), customEmojiMap);

  // Discoverable
  const discoverable = Boolean(account.discoverable || account.source?.pleroma?.discoverable);
  account.discoverable = discoverable;

  // Message Acceptance
  const acceptsChatMessages = Boolean(account.pleroma?.accepts_chat_messages || account?.accepting_messages);
  account.accepts_chat_messages = acceptsChatMessages;

  // Notes
  account.note_emojified = emojify(account.note, customEmojiMap);

  /**
   * Todo
   * - internal fields
   * - donor
   * - tags
   * - fields
   * - pleroma legacy fields
   * - emojification
   * - domain
   * - guessFqn
   * - fqn
   * - favicon
   * - staff fields
   * - birthday
   * - note
   */

  return account;
});

type Account = z.infer<typeof accountSchema>;

export { accountSchema, type Account };