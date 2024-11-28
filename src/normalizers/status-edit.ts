/**
 * Status edit normalizer
 */
import {
  Map as ImmutableMap,
  List as ImmutableList,
  Record as ImmutableRecord,
  fromJS,
} from 'immutable';
import DOMPurify from 'isomorphic-dompurify';

import { normalizeAttachment } from 'soapbox/normalizers/attachment.ts';
import { normalizeEmoji } from 'soapbox/normalizers/emoji.ts';
import { pollSchema } from 'soapbox/schemas/index.ts';
import { stripCompatibilityFeatures } from 'soapbox/utils/html.ts';

import type { Account, Attachment, Emoji, EmbeddedEntity, Poll } from 'soapbox/types/entities.ts';

export const StatusEditRecord = ImmutableRecord({
  account: null as EmbeddedEntity<Account>,
  content: '',
  created_at: new Date(),
  emojis: ImmutableList<Emoji>(),
  favourited: false,
  media_attachments: ImmutableList<Attachment>(),
  poll: null as EmbeddedEntity<Poll>,
  sensitive: false,
  spoiler_text: '',
});

const normalizeAttachments = (statusEdit: ImmutableMap<string, any>) => {
  return statusEdit.update('media_attachments', ImmutableList(), attachments => {
    return attachments.map(normalizeAttachment);
  });
};

// Normalize emojis
const normalizeEmojis = (entity: ImmutableMap<string, any>) => {
  return entity.update('emojis', ImmutableList(), emojis => {
    return emojis.map(normalizeEmoji);
  });
};

// Normalize the poll in the status, if applicable
const normalizeStatusPoll = (statusEdit: ImmutableMap<string, any>) => {
  try {
    const poll = pollSchema.parse(statusEdit.get('poll').toJS());
    return statusEdit.set('poll', poll);
  } catch (_e) {
    return statusEdit.set('poll', null);
  }
};

const normalizeContent = (statusEdit: ImmutableMap<string, any>) => {
  const content = DOMPurify.sanitize(stripCompatibilityFeatures(statusEdit.get('content')), { ADD_ATTR: ['target'] });
  return statusEdit.set('content', content);
};

export const normalizeStatusEdit = (statusEdit: Record<string, any>) => {
  return StatusEditRecord(
    ImmutableMap(fromJS(statusEdit)).withMutations(statusEdit => {
      normalizeAttachments(statusEdit);
      normalizeEmojis(statusEdit);
      normalizeStatusPoll(statusEdit);
      normalizeContent(statusEdit);
    }),
  );
};
