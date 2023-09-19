/**
 * Status normalizer:
 * Converts API statuses into our internal format.
 * @see {@link https://docs.joinmastodon.org/entities/status/}
 */
import {
  Map as ImmutableMap,
  List as ImmutableList,
  Record as ImmutableRecord,
  fromJS,
} from 'immutable';

import { normalizeAttachment } from 'soapbox/normalizers/attachment';
import { normalizeEmoji } from 'soapbox/normalizers/emoji';
import { normalizeMention } from 'soapbox/normalizers/mention';
import { accountSchema, cardSchema, groupSchema, pollSchema, tombstoneSchema } from 'soapbox/schemas';
import { maybeFromJS } from 'soapbox/utils/normalizers';

import type { Account, Attachment, Card, Emoji, Group, Mention, Poll, EmbeddedEntity } from 'soapbox/types/entities';

export type StatusApprovalStatus = 'pending' | 'approval' | 'rejected';
export type StatusVisibility = 'public' | 'unlisted' | 'private' | 'direct' | 'self' | 'group';

export type EventJoinMode = 'free' | 'restricted' | 'invite';
export type EventJoinState = 'pending' | 'reject' | 'accept';

export const EventRecord = ImmutableRecord({
  name: '',
  start_time: null as string | null,
  end_time: null as string | null,
  join_mode: null as EventJoinMode | null,
  participants_count: 0,
  location: null as ImmutableMap<string, any> | null,
  join_state: null as EventJoinState | null,
  banner: null as Attachment | null,
  links: ImmutableList<Attachment>(),
});

interface Tombstone {
  reason: 'deleted'
}

// https://docs.joinmastodon.org/entities/status/
export const StatusRecord = ImmutableRecord({
  account: null as unknown as Account,
  application: null as ImmutableMap<string, any> | null,
  approval_status: 'approved' as StatusApprovalStatus,
  bookmarked: false,
  card: null as Card | null,
  content: '',
  created_at: '',
  dislikes_count: 0,
  disliked: false,
  edited_at: null as string | null,
  emojis: ImmutableList<Emoji>(),
  favourited: false,
  favourites_count: 0,
  filtered: ImmutableList<string>(),
  group: null as Group | null,
  in_reply_to_account_id: null as string | null,
  in_reply_to_id: null as string | null,
  id: '',
  language: null as string | null,
  media_attachments: ImmutableList<Attachment>(),
  mentions: ImmutableList<Mention>(),
  muted: false,
  pinned: false,
  pleroma: ImmutableMap<string, any>(),
  poll: null as EmbeddedEntity<Poll>,
  quote: null as EmbeddedEntity<any>,
  quotes_count: 0,
  reblog: null as EmbeddedEntity<any>,
  reblogged: false,
  reblogs_count: 0,
  replies_count: 0,
  sensitive: false,
  spoiler_text: '',
  tags: ImmutableList<ImmutableMap<string, any>>(),
  tombstone: null as Tombstone | null,
  uri: '',
  url: '',
  visibility: 'public' as StatusVisibility,
  event: null as ReturnType<typeof EventRecord> | null,

  // Internal fields
  contentHtml: '',
  expectsCard: false,
  hidden: false,
  search_index: '',
  showFiltered: true,
  spoilerHtml: '',
  translation: null as ImmutableMap<string, string> | null,
});

const normalizeAttachments = (status: ImmutableMap<string, any>) => {
  return status.update('media_attachments', ImmutableList(), attachments => {
    return attachments.map(normalizeAttachment);
  });
};

const normalizeMentions = (status: ImmutableMap<string, any>) => {
  return status.update('mentions', ImmutableList(), mentions => {
    return mentions.map(normalizeMention);
  });
};

// Normalize emojis
const normalizeEmojis = (entity: ImmutableMap<string, any>) => {
  return entity.update('emojis', ImmutableList(), emojis => {
    return emojis.map(normalizeEmoji);
  });
};

// Normalize the poll in the status, if applicable
const normalizeStatusPoll = (status: ImmutableMap<string, any>) => {
  try {
    const poll = pollSchema.parse(status.get('poll').toJS());
    return status.set('poll', poll);
  } catch (_e) {
    return status.set('poll', null);
  }
};

const normalizeTombstone = (status: ImmutableMap<string, any>) => {
  try {
    const tombstone = tombstoneSchema.parse(status.get('tombstone').toJS());
    return status.set('tombstone', tombstone);
  } catch (_e) {
    return status.set('tombstone', null);
  }
};

// Normalize card
const normalizeStatusCard = (status: ImmutableMap<string, any>) => {
  try {
    const card = cardSchema.parse(status.get('card').toJS());
    return status.set('card', card);
  } catch (e) {
    return status.set('card', null);
  }
};

// Fix order of mentions
const fixMentionsOrder = (status: ImmutableMap<string, any>) => {
  const mentions = status.get('mentions', ImmutableList());
  const inReplyToAccountId = status.get('in_reply_to_account_id');

  // Sort the replied-to mention to the top
  const sorted = mentions.sort((a: ImmutableMap<string, any>, _b: ImmutableMap<string, any>) => {
    if (a.get('id') === inReplyToAccountId) {
      return -1;
    } else {
      return 0;
    }
  });

  return status.set('mentions', sorted);
};

// Add self to mentions if it's a reply to self
const addSelfMention = (status: ImmutableMap<string, any>) => {
  const accountId = status.getIn(['account', 'id']);

  const isSelfReply = accountId === status.get('in_reply_to_account_id');
  const hasSelfMention = accountId === status.getIn(['mentions', 0, 'id']);

  if (isSelfReply && !hasSelfMention && accountId) {
    const mention = normalizeMention(status.get('account'));
    return status.update('mentions', ImmutableList(), mentions => (
      ImmutableList([mention]).concat(mentions)
    ));
  } else {
    return status;
  }
};

// Move the quote to the top-level
const fixQuote = (status: ImmutableMap<string, any>) => {
  return status.withMutations(status => {
    status.update('quote', quote => quote || status.getIn(['pleroma', 'quote']) || null);
    status.deleteIn(['pleroma', 'quote']);
    status.update('quotes_count', quotes_count => quotes_count || status.getIn(['pleroma', 'quotes_count'], 0));
    status.deleteIn(['pleroma', 'quotes_count']);
  });
};

/** If the status contains spoiler text, treat it as sensitive. */
const fixSensitivity = (status: ImmutableMap<string, any>) => {
  if (status.get('spoiler_text')) {
    status.set('sensitive', true);
  }
};

// Normalize event
const normalizeEvent = (status: ImmutableMap<string, any>) => {
  if (status.getIn(['pleroma', 'event'])) {
    const firstAttachment = status.get('media_attachments').first();
    let banner = null;
    let mediaAttachments = status.get('media_attachments');

    if (firstAttachment && firstAttachment.description === 'Banner' && firstAttachment.type === 'image') {
      banner = normalizeAttachment(firstAttachment);
      mediaAttachments = mediaAttachments.shift();
    }

    const links = mediaAttachments.filter((attachment: Attachment) => attachment.pleroma.get('mime_type') === 'text/html');
    mediaAttachments = mediaAttachments.filter((attachment: Attachment) => attachment.pleroma.get('mime_type') !== 'text/html');

    const event = EventRecord(
      (status.getIn(['pleroma', 'event']) as ImmutableMap<string, any>)
        .set('banner', banner)
        .set('links', links),
    );

    status
      .set('event', event)
      .set('media_attachments', mediaAttachments);
  }
};

/** Rewrite `<p></p>` to empty string. */
const fixContent = (status: ImmutableMap<string, any>) => {
  if (status.get('content') === '<p></p>') {
    return status.set('content', '');
  } else {
    return status;
  }
};

const normalizeFilterResults = (status: ImmutableMap<string, any>) =>
  status.update('filtered', ImmutableList(), filterResults =>
    filterResults.map((filterResult: ImmutableMap<string, any>) =>
      filterResult.getIn(['filter', 'title']),
    ),
  );

const normalizeDislikes = (status: ImmutableMap<string, any>) => {
  if (status.get('friendica')) {
    return status
      .set('dislikes_count', status.getIn(['friendica', 'dislikes_count']))
      .set('disliked', status.getIn(['friendica', 'disliked']));
  }

  return status;
};

const parseAccount = (status: ImmutableMap<string, any>) => {
  try {
    const account = accountSchema.parse(maybeFromJS(status.get('account')));
    return status.set('account', account);
  } catch (_e) {
    return status.set('account', null);
  }
};

const parseGroup = (status: ImmutableMap<string, any>) => {
  try {
    const group = groupSchema.parse(status.get('group').toJS());
    return status.set('group', group);
  } catch (_e) {
    return status.set('group', null);
  }
};

export const normalizeStatus = (status: Record<string, any>) => {
  return StatusRecord(
    ImmutableMap(fromJS(status)).withMutations(status => {
      normalizeAttachments(status);
      normalizeMentions(status);
      normalizeEmojis(status);
      normalizeStatusPoll(status);
      normalizeStatusCard(status);
      fixMentionsOrder(status);
      addSelfMention(status);
      fixQuote(status);
      fixSensitivity(status);
      normalizeEvent(status);
      fixContent(status);
      normalizeFilterResults(status);
      normalizeDislikes(status);
      normalizeTombstone(status);
      parseAccount(status);
      parseGroup(status);
    }),
  );
};
