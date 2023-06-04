/** Notification types known to Soapbox. */
const NOTIFICATION_TYPES = [
  'follow',
  'follow_request',
  'mention',
  'reblog',
  'favourite',
  'group_favourite',
  'group_reblog',
  'poll',
  'status',
  'move',
  'pleroma:chat_mention',
  'pleroma:emoji_reaction',
  'user_approved',
  'update',
  'pleroma:event_reminder',
  'pleroma:participation_request',
  'pleroma:participation_accepted',
] as const;

/** Notification types to exclude from the "All" filter by default. */
const EXCLUDE_TYPES = [
  'pleroma:chat_mention',
  'chat', // TruthSocial
] as const;

type NotificationType = typeof NOTIFICATION_TYPES[number];

/** Ensure the Notification is a valid, known type. */
const validType = (type: string): type is NotificationType => NOTIFICATION_TYPES.includes(type as any);

export {
  NOTIFICATION_TYPES,
  EXCLUDE_TYPES,
  NotificationType,
  validType,
};
