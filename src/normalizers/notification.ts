/**
 * Notification normalizer:
 * Converts API notifications into our internal format.
 * @see {@link https://docs.joinmastodon.org/entities/notification/}
 */
import { fromDefaults } from '@/utils/normalizers.ts';

import type { Account, Status, EmbeddedEntity } from '@/types/entities.ts';

// https://docs.joinmastodon.org/entities/notification/
export interface Notification {
  account: EmbeddedEntity<Account>;
  chat_message: Record<string, any> | string | null; // pleroma:chat_mention
  created_at: Date | string;
  emoji: string | null; // pleroma:emoji_reaction
  emoji_url: string | null; // pleroma:emoji_reaction
  id: string;
  status: EmbeddedEntity<Status>;
  target: EmbeddedEntity<Account>; // move
  type: string;
  total_count: number | null; // grouped notifications
}

export const normalizeNotification = (notification: Record<string, any>): Notification => {
  const result = fromDefaults<Notification>({
    account: null,
    chat_message: null,
    created_at: new Date(),
    emoji: null,
    emoji_url: null,
    id: '',
    status: null,
    target: null,
    type: '',
    total_count: null,
  }, notification);

  if (result.type === 'group_mention') {
    result.type = 'mention';
  }

  return result;
};
