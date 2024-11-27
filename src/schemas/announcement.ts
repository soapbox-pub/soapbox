import { z } from 'zod';

import { announcementReactionSchema } from './announcement-reaction.ts';
import { customEmojiSchema } from './custom-emoji.ts';
import { mentionSchema } from './mention.ts';
import { tagSchema } from './tag.ts';
import { dateSchema, filteredArray } from './utils.ts';

import type { Resolve } from 'soapbox/utils/types.ts';

// https://docs.joinmastodon.org/entities/announcement/
const announcementSchema = z.object({
  id: z.string(),
  content: z.string().catch(''),
  starts_at: z.string().datetime().nullable().catch(null),
  ends_at: z.string().datetime().nullable().catch(null),
  all_day: z.boolean().catch(false),
  read: z.boolean().catch(false),
  published_at: dateSchema,
  reactions: filteredArray(announcementReactionSchema),
  statuses: z.preprocess(
    (statuses: any) => Array.isArray(statuses)
      ? Object.fromEntries(statuses.map((status: any) => [status.url, status.account?.acct]) || [])
      : statuses,
    z.record(z.string(), z.string()),
  ),
  mentions: filteredArray(mentionSchema),
  tags: filteredArray(tagSchema),
  emojis: filteredArray(customEmojiSchema),
  updated_at: dateSchema,
});

type Announcement = Resolve<z.infer<typeof announcementSchema>>;

const adminAnnouncementSchema = announcementSchema.extend({
  pleroma: z.object({
    raw_content: z.string().catch(''),
  }),
});

type AdminAnnouncement = Resolve<z.infer<typeof adminAnnouncementSchema>>;

export { announcementSchema, adminAnnouncementSchema, type Announcement, type AdminAnnouncement };
