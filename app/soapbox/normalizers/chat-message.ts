import {
  List as ImmutableList,
  Map as ImmutableMap,
  Record as ImmutableRecord,
  fromJS,
} from 'immutable';

import { normalizeAttachment } from 'soapbox/normalizers/attachment';

import { normalizeEmojiReaction } from './emoji-reaction';

import type { Attachment, Card, Emoji, EmojiReaction } from 'soapbox/types/entities';

export const ChatMessageRecord = ImmutableRecord({
  account_id: '',
  media_attachments: ImmutableList<Attachment>(),
  card: null as Card | null,
  chat_id: '',
  content: '',
  created_at: '',
  emojis: ImmutableList<Emoji>(),
  expiration: null as number | null,
  emoji_reactions: null as ImmutableList<EmojiReaction> | null,
  id: '',
  unread: false,
  deleting: false,
  pending: false as boolean | undefined,
});

const normalizeMedia = (status: ImmutableMap<string, any>) => {
  const attachments = status.get('media_attachments');
  const attachment = status.get('attachment');

  if (attachments) {
    return status.set('media_attachments', ImmutableList(attachments.map(normalizeAttachment)));
  } else if (attachment) {
    return status.set('media_attachments', ImmutableList([normalizeAttachment(attachment)]));
  } else {
    return status.set('media_attachments', ImmutableList());
  }
};

const normalizeChatMessageEmojiReaction = (chatMessage: ImmutableMap<string, any>) => {
  const emojiReactions = chatMessage.get('emoji_reactions');

  if (emojiReactions) {
    return chatMessage.set('emoji_reactions', ImmutableList(emojiReactions.map(normalizeEmojiReaction)));
  } else {
    return chatMessage;
  }
};

/** Rewrite `<p></p>` to empty string. */
const fixContent = (chatMessage: ImmutableMap<string, any>) => {
  if (chatMessage.get('content') === '<p></p>') {
    return chatMessage.set('content', '');
  } else {
    return chatMessage;
  }
};

export const normalizeChatMessage = (chatMessage: Record<string, any>) => {
  return ChatMessageRecord(
    ImmutableMap(fromJS(chatMessage)).withMutations(chatMessage => {
      normalizeMedia(chatMessage);
      normalizeChatMessageEmojiReaction(chatMessage);
      fixContent(chatMessage);
    }),
  );
};
