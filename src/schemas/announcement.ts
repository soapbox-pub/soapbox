import { z } from 'zod';

import emojify from 'soapbox/features/emoji';

import { announcementReactionSchema } from './announcement-reaction';
import { customEmojiSchema } from './custom-emoji';
import { mentionSchema } from './mention';
import { tagSchema } from './tag';
import { dateSchema, filteredArray, makeCustomEmojiMap } from './utils';

import type { Resolve } from 'soapbox/utils/types';

const transformAnnouncement = (announcement: Resolve<z.infer<typeof baseAnnouncementSchema>>) => {
  const emojiMap = makeCustomEmojiMap(announcement.emojis);

  const contentHtml = emojify(announcement.content, emojiMap);

  return {
    ...announcement,
    contentHtml,
  };
};

// https://docs.joinmastodon.org/entities/announcement/
const baseAnnouncementSchema = z.object({
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

const announcementSchema = baseAnnouncementSchema.transform(transformAnnouncement);

type Announcement = Resolve<z.infer<typeof announcementSchema>>;

const adminAnnouncementSchema = baseAnnouncementSchema.extend({
  pleroma: z.object({
    raw_content: z.string().catch(''),
  }),
}).transform(transformAnnouncement);

type AdminAnnouncement = Resolve<z.infer<typeof adminAnnouncementSchema>>;

export { announcementSchema, adminAnnouncementSchema, type Announcement, type AdminAnnouncement };
