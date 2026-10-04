/**
 * Status normalizer:
 * Converts API statuses into our internal format.
 * @see {@link https://docs.joinmastodon.org/entities/status/}
 */
import { normalizeAttachment } from '@/normalizers/attachment.ts';
import { normalizeEmoji } from '@/normalizers/emoji.ts';
import { normalizeMention } from '@/normalizers/mention.ts';
import { accountSchema, cardSchema, emojiReactionSchema, groupSchema, pollSchema, tombstoneSchema } from '@/schemas/index.ts';
import { filteredArray } from '@/schemas/utils.ts';
import { fromDefaults } from '@/utils/normalizers.ts';

import type { Account } from '@/schemas/index.ts';
import type { Attachment, Card, Emoji, Group, Mention, Poll, EmbeddedEntity, EmojiReaction } from '@/types/entities.ts';

export type StatusApprovalStatus = 'pending' | 'approval' | 'rejected';
export type StatusVisibility = 'public' | 'unlisted' | 'private' | 'direct' | 'self' | 'group';

export type EventJoinMode = 'free' | 'restricted' | 'invite';
export type EventJoinState = 'pending' | 'reject' | 'accept';

export interface EventLocation {
  name?: string;
  street?: string;
  postalCode?: string;
  locality?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  [key: string]: unknown;
}

export interface StatusEvent {
  name: string;
  start_time: string | null;
  end_time: string | null;
  join_mode: EventJoinMode | null;
  participants_count: number;
  location: EventLocation | null;
  join_state: EventJoinState | null;
  banner: Attachment | null;
  links: Attachment[];
}

interface Tombstone {
  reason: 'deleted';
}

export interface StatusApplication {
  name?: string;
  website?: string | null;
  [key: string]: unknown;
}

export interface StatusPleroma {
  quote_url?: string;
  quote_visible?: boolean;
  [key: string]: unknown;
}

export interface StatusTag {
  name: string;
  url: string;
  history?: { accounts: number; uses: number }[] | null;
  following?: boolean;
}

export interface StatusTranslation {
  content: string;
  detected_source_language?: string;
  provider?: string;
}

// https://docs.joinmastodon.org/entities/status/
export interface Status {
  account: Account;
  application: StatusApplication | null;
  approval_status: StatusApprovalStatus;
  bookmarked: boolean;
  card: Card | null;
  content: string;
  created_at: string;
  dislikes_count: number;
  disliked: boolean;
  edited_at: string | null;
  emojis: Emoji[];
  favourited: boolean;
  favourites_count: number;
  filtered: string[];
  group: Group | null;
  in_reply_to_account_id: string | null;
  in_reply_to_id: string | null;
  id: string;
  language: string | null;
  media_attachments: Attachment[];
  mentions: Mention[];
  muted: boolean;
  pinned: boolean;
  pleroma: StatusPleroma;
  poll: EmbeddedEntity<Poll>;
  quote: EmbeddedEntity<Status>;
  quotes_count: number;
  reactions: EmojiReaction[] | null;
  reblog: EmbeddedEntity<Status>;
  reblogged: boolean;
  reblogs_count: number;
  replies_count: number;
  sensitive: boolean;
  spoiler_text: string;
  tags: StatusTag[];
  tombstone: Tombstone | null;
  uri: string;
  url: string;
  visibility: StatusVisibility;
  event: StatusEvent | null;

  // Internal fields
  expectsCard: boolean;
  hidden: boolean;
  search_index: string;
  showFiltered: boolean;
  translation: StatusTranslation | null;
}

const statusDefaults = (): Status => ({
  account: null as unknown as Account,
  application: null,
  approval_status: 'approved' as StatusApprovalStatus,
  bookmarked: false,
  card: null,
  content: '',
  created_at: '',
  dislikes_count: 0,
  disliked: false,
  edited_at: null,
  emojis: [],
  favourited: false,
  favourites_count: 0,
  filtered: [],
  group: null,
  in_reply_to_account_id: null,
  in_reply_to_id: null,
  id: '',
  language: null,
  media_attachments: [],
  mentions: [],
  muted: false,
  pinned: false,
  pleroma: {},
  poll: null,
  quote: null,
  quotes_count: 0,
  reactions: null,
  reblog: null,
  reblogged: false,
  reblogs_count: 0,
  replies_count: 0,
  sensitive: false,
  spoiler_text: '',
  tags: [],
  tombstone: null,
  uri: '',
  url: '',
  visibility: 'public',
  event: null,

  // Internal fields
  expectsCard: false,
  hidden: false,
  search_index: '',
  showFiltered: true,
  translation: null,
});

/** Parse a value with a schema, falling back to `null` if it's invalid. */
const parseOrNull = <T>(schema: { safeParse(value: unknown): { success: true; data: T } | { success: false } }, value: unknown): T | null => {
  const result = schema.safeParse(value);
  return result.success ? result.data : null;
};

// Sort the replied-to mention to the top
const fixMentionsOrder = (mentions: Mention[], inReplyToAccountId: string | null): Mention[] => {
  return [...mentions].sort((a, _b) => a.id === inReplyToAccountId ? -1 : 0);
};

// Add self to mentions if it's a reply to self
const addSelfMention = (status: Record<string, any>, mentions: Mention[]): Mention[] => {
  const accountId = status.account?.id;

  const isSelfReply = accountId === status.in_reply_to_account_id;
  const hasSelfMention = accountId === mentions[0]?.id;

  if (isSelfReply && !hasSelfMention && accountId) {
    return [normalizeMention(status.account), ...mentions];
  } else {
    return mentions;
  }
};

// Normalize event
const normalizeEvent = (data: Record<string, any>, mediaAttachments: Attachment[]) => {
  const event = data.pleroma?.event;

  if (!event) {
    return { event: null, mediaAttachments };
  }

  const firstAttachment = mediaAttachments[0];
  let banner: Attachment | null = null;

  if (firstAttachment && firstAttachment.description === 'Banner' && firstAttachment.type === 'image') {
    banner = normalizeAttachment(firstAttachment);
    mediaAttachments = mediaAttachments.slice(1);
  }

  const links = mediaAttachments.filter((attachment) => attachment.pleroma.mime_type === 'text/html');
  mediaAttachments = mediaAttachments.filter((attachment) => attachment.pleroma.mime_type !== 'text/html');

  return {
    event: fromDefaults<StatusEvent>({
      name: '',
      start_time: null,
      end_time: null,
      join_mode: null,
      participants_count: 0,
      location: null,
      join_state: null,
      banner: null,
      links: [],
    }, { ...event, banner, links }),
    mediaAttachments,
  };
};

export const normalizeStatus = (data: Record<string, any>): Status => {
  const status = fromDefaults(statusDefaults(), data);

  const mediaAttachments: Attachment[] = (data.media_attachments ?? []).map(normalizeAttachment);
  const mentions: Mention[] = (data.mentions ?? []).map(normalizeMention);

  status.reactions = filteredArray(emojiReactionSchema).parse(data.pleroma?.emoji_reactions || data.reactions || []);
  status.poll = parseOrNull(pollSchema, data.poll);
  status.card = parseOrNull(cardSchema, data.card);
  status.mentions = addSelfMention(data, fixMentionsOrder(mentions, status.in_reply_to_account_id));

  // Move the quote to the top-level
  const { quote: pleromaQuote, quotes_count: pleromaQuotesCount, ...pleroma } = data.pleroma ?? {};
  status.pleroma = pleroma;
  status.quote = data.quote || pleromaQuote || null;
  status.quotes_count = data.quotes_count || pleromaQuotesCount || 0;

  const { event, mediaAttachments: remainingAttachments } = normalizeEvent(data, mediaAttachments);
  status.event = event;
  status.media_attachments = remainingAttachments;

  status.emojis = (data.emojis ?? []).map(normalizeEmoji);

  // Rewrite `<p></p>` to empty string.
  if (status.content === '<p></p>') {
    status.content = '';
  }

  status.filtered = (data.filtered ?? []).map((filterResult: any) =>
    typeof filterResult === 'string' ? filterResult : filterResult?.filter?.title,
  );

  if (data.friendica) {
    status.dislikes_count = data.friendica.dislikes_count;
    status.disliked = data.friendica.disliked;
  }

  status.tombstone = parseOrNull(tombstoneSchema, data.tombstone);
  status.account = parseOrNull(accountSchema, data.account) as Account;
  status.group = parseOrNull(groupSchema, data.group);

  return status;
};
