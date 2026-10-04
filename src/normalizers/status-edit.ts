/**
 * Status edit normalizer
 */
import DOMPurify from 'isomorphic-dompurify';

import { normalizeAttachment } from '@/normalizers/attachment.ts';
import { normalizeEmoji } from '@/normalizers/emoji.ts';
import { pollSchema } from '@/schemas/index.ts';
import { stripCompatibilityFeatures } from '@/utils/html.ts';
import { fromDefaults } from '@/utils/normalizers.ts';

import type { Account, Attachment, Emoji, EmbeddedEntity, Poll } from '@/types/entities.ts';

export interface StatusEdit {
  account: EmbeddedEntity<Account>;
  content: string;
  created_at: Date | string;
  emojis: Emoji[];
  favourited: boolean;
  media_attachments: Attachment[];
  poll: EmbeddedEntity<Poll>;
  sensitive: boolean;
  spoiler_text: string;
}

export const normalizeStatusEdit = (statusEdit: Record<string, any>): StatusEdit => {
  const result = fromDefaults<StatusEdit>({
    account: null,
    content: '',
    created_at: new Date(),
    emojis: [],
    favourited: false,
    media_attachments: [],
    poll: null,
    sensitive: false,
    spoiler_text: '',
  }, statusEdit);

  result.media_attachments = (statusEdit.media_attachments ?? []).map(normalizeAttachment);
  result.emojis = (statusEdit.emojis ?? []).map(normalizeEmoji);

  // Normalize the poll in the status, if applicable
  const poll = pollSchema.safeParse(statusEdit.poll);
  result.poll = poll.success ? poll.data : null;

  result.content = DOMPurify.sanitize(stripCompatibilityFeatures(statusEdit.content), { ADD_ATTR: ['target'] });

  return result;
};
