/**
 * Notification normalizer:
 * Converts API notifications into our internal format.
 * @see {@link https://docs.joinmastodon.org/entities/notification/}
 */
import {
  Map as ImmutableMap,
  Record as ImmutableRecord,
  fromJS,
} from 'immutable';

import { normalizeAccount } from './account';
import { normalizeStatus } from './status';

import type { Account, Status, EmbeddedEntity } from 'soapbox/types/entities';

// https://docs.joinmastodon.org/entities/notification/
export const NotificationRecord = ImmutableRecord({
  account: null as EmbeddedEntity<Account>,
  chat_message: null as ImmutableMap<string, any> | string | null, // pleroma:chat_mention
  created_at: new Date(),
  emoji: null as string | null, // pleroma:emoji_reaction
  id: '',
  status: null as EmbeddedEntity<Status>,
  target: null as EmbeddedEntity<Account>, // move
  type: '',
  total_count: null as number | null, // grouped notifications
});

export const normalizeNotification = (notification: Record<string, any>) => {
  return NotificationRecord(
    ImmutableMap(fromJS(notification)).withMutations(notification => {
      if (notification.get('status')) {
        notification.set('status', normalizeStatus(notification.get('status') as any) as any);
      }

      if (notification.get('account')) {
        notification.set('account', normalizeAccount(notification.get('account') as any) as any);
      }
    }),
  );
};
