import { z } from 'zod';

import { accountSchema } from './account.ts';
import { chatMessageSchema } from './chat-message.ts';
import { statusSchema } from './status.ts';
import { emojiSchema } from './utils.ts';

const baseNotificationSchema = z.object({
  account: accountSchema,
  created_at: z.string().datetime().catch(new Date().toUTCString()),
  id: z.string(),
  type: z.string(),
});

const mentionNotificationSchema = baseNotificationSchema.extend({
  type: z.literal('mention'),
  status: statusSchema,
});

const statusNotificationSchema = baseNotificationSchema.extend({
  type: z.literal('status'),
  status: statusSchema,
});

const reblogNotificationSchema = baseNotificationSchema.extend({
  type: z.literal('reblog'),
  status: statusSchema,
});

const followNotificationSchema = baseNotificationSchema.extend({
  type: z.literal('follow'),
});

const followRequestNotificationSchema = baseNotificationSchema.extend({
  type: z.literal('follow_request'),
});

const favouriteNotificationSchema = baseNotificationSchema.extend({
  type: z.literal('favourite'),
  status: statusSchema,
});

const pollNotificationSchema = baseNotificationSchema.extend({
  type: z.literal('poll'),
  status: statusSchema,
});

const updateNotificationSchema = baseNotificationSchema.extend({
  type: z.literal('update'),
  status: statusSchema,
});

const moveNotificationSchema = baseNotificationSchema.extend({
  type: z.literal('move'),
  target: accountSchema,
});

const chatMessageNotificationSchema = baseNotificationSchema.extend({
  type: z.literal('chat_message'),
  chat_message: chatMessageSchema,
});

const emojiReactionNotificationSchema = baseNotificationSchema.extend({
  type: z.literal('pleroma:emoji_reaction'),
  emoji: emojiSchema,
  emoji_url: z.string().url().optional().catch(undefined),
});

const eventReminderNotificationSchema = baseNotificationSchema.extend({
  type: z.literal('pleroma:event_reminder'),
  status: statusSchema,
});

const participationRequestNotificationSchema = baseNotificationSchema.extend({
  type: z.literal('pleroma:participation_request'),
  status: statusSchema,
});

const participationAcceptedNotificationSchema = baseNotificationSchema.extend({
  type: z.literal('pleroma:participation_accepted'),
  status: statusSchema,
});

const nameGrantNotificationSchema = baseNotificationSchema.extend({
  type: z.literal('ditto:name_grant'),
  name: z.string(),
});

const notificationSchema = z.discriminatedUnion('type', [
  mentionNotificationSchema,
  statusNotificationSchema,
  reblogNotificationSchema,
  followNotificationSchema,
  followRequestNotificationSchema,
  favouriteNotificationSchema,
  pollNotificationSchema,
  updateNotificationSchema,
  moveNotificationSchema,
  chatMessageNotificationSchema,
  emojiReactionNotificationSchema,
  eventReminderNotificationSchema,
  participationRequestNotificationSchema,
  participationAcceptedNotificationSchema,
  nameGrantNotificationSchema,
]);

type Notification = z.infer<typeof notificationSchema>;

export { notificationSchema, type Notification };