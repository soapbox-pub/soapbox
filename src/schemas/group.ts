import z from 'zod';

import avatarMissing from '@/assets/images/avatar-missing.png';
import headerMissing from '@/assets/images/header-missing.png';
import { sanitizeHtml } from '@/utils/sanitize.ts';

import { customEmojiSchema } from './custom-emoji.ts';
import { groupRelationshipSchema } from './group-relationship.ts';
import { groupTagSchema } from './group-tag.ts';
import { filteredArray, mediaUrlSchema } from './utils.ts';

const groupSchema = z.object({
  avatar: mediaUrlSchema(avatarMissing),
  avatar_static: mediaUrlSchema(''),
  created_at: z.string().datetime().catch(new Date().toUTCString()),
  deleted_at: z.string().datetime().or(z.null()).catch(null),
  display_name: z.string().catch(''),
  domain: z.string().catch(''),
  emojis: filteredArray(customEmojiSchema),
  group_visibility: z.string().catch(''), // TruthSocial
  header: mediaUrlSchema(headerMissing),
  header_static: mediaUrlSchema(''),
  id: z.coerce.string(),
  locked: z.boolean().catch(false),
  membership_required: z.boolean().catch(false),
  members_count: z.number().catch(0),
  owner: z.object({ id: z.string() }),
  note: z.string().transform(note => note === '<p></p>' ? '' : note).catch(''),
  relationship: groupRelationshipSchema.nullable().catch(null), // Dummy field to be overwritten later
  slug: z.string().catch(''), // TruthSocial
  source: z.object({
    note: z.string(),
  }).optional(), // TruthSocial
  statuses_visibility: z.string().catch('public'),
  tags: z.array(groupTagSchema).catch([]),
  uri: z.string().catch(''),
  url: z.string().catch(''),
}).transform(group => {
  group.avatar_static = group.avatar_static || group.avatar;
  group.header_static = group.header_static || group.header;
  group.locked = group.locked || group.group_visibility === 'members_only'; // TruthSocial

  return {
    ...group,
    note: sanitizeHtml(group.note),
  };
});

type Group = z.infer<typeof groupSchema>;

export { groupSchema, type Group };
