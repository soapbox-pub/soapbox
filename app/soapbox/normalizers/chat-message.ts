import {
  List as ImmutableList,
  Map as ImmutableMap,
  Record as ImmutableRecord,
  fromJS,
} from 'immutable';

import { normalizeAttachment } from 'soapbox/normalizers/attachment';

import type { Attachment, Card, Emoji } from 'soapbox/types/entities';

export const ChatMessageRecord = ImmutableRecord({
  account_id: '',
  media_attachments: ImmutableList<Attachment>(),
  card: null as Card | null,
  chat_id: '',
  content: '',
  created_at: '',
  emojis: ImmutableList<Emoji>(),
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

export const normalizeChatMessage = (chatMessage: Record<string, any>) => {
  return ChatMessageRecord(
    ImmutableMap(fromJS(chatMessage)).withMutations(chatMessage => {
      normalizeMedia(chatMessage);
    }),
  );
};
