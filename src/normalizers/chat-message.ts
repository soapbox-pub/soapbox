import { normalizeAttachment } from '@/normalizers/attachment.ts';
import { emojiReactionSchema } from '@/schemas/index.ts';
import { filteredArray } from '@/schemas/utils.ts';
import { fromDefaults } from '@/utils/normalizers.ts';

import type { Attachment, Card, Emoji, EmojiReaction } from '@/types/entities.ts';

export interface ChatMessage {
  account_id: string;
  media_attachments: Attachment[];
  card: Card | null;
  chat_id: string;
  content: string;
  created_at: string;
  emojis: Emoji[];
  expiration: number | null;
  emoji_reactions: readonly EmojiReaction[] | null;
  id: string;
  unread: boolean;
  deleting: boolean;
  pending: boolean | undefined;
}

export const normalizeChatMessage = (chatMessage: Record<string, any>): ChatMessage => {
  const result = fromDefaults<ChatMessage>({
    account_id: '',
    media_attachments: [],
    card: null,
    chat_id: '',
    content: '',
    created_at: '',
    emojis: [],
    expiration: null,
    emoji_reactions: null,
    id: '',
    unread: false,
    deleting: false,
    pending: false,
  }, chatMessage);

  const attachments = chatMessage.media_attachments;
  const attachment = chatMessage.attachment;

  if (attachments) {
    result.media_attachments = attachments.map(normalizeAttachment);
  } else if (attachment) {
    result.media_attachments = [normalizeAttachment(attachment)];
  } else {
    result.media_attachments = [];
  }

  result.emoji_reactions = filteredArray(emojiReactionSchema).parse(chatMessage.emoji_reactions || []);

  // Rewrite `<p></p>` to empty string.
  if (result.content === '<p></p>') {
    result.content = '';
  }

  return result;
};
