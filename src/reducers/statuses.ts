import { produce, type Draft } from 'immer';
import DOMPurify from 'isomorphic-dompurify';

import {
  BOOKMARK_REQUEST,
  BOOKMARK_FAIL,
  UNBOOKMARK_REQUEST,
  UNBOOKMARK_FAIL,
} from '@/actions/bookmarks.ts';
import { normalizeStatus } from '@/normalizers/index.ts';
import { simulateEmojiReact, simulateUnEmojiReact } from '@/utils/emoji-reacts.ts';
import { htmlToPlaintext, stripCompatibilityFeatures } from '@/utils/html.ts';
import { normalizeId } from '@/utils/normalizers.ts';

import {
  EMOJI_REACT_REQUEST,
  UNEMOJI_REACT_REQUEST,
} from '../actions/emoji-reacts.ts';
import {
  EVENT_JOIN_REQUEST,
  EVENT_JOIN_FAIL,
  EVENT_LEAVE_REQUEST,
  EVENT_LEAVE_FAIL,
} from '../actions/events.ts';
import { STATUS_IMPORT, STATUSES_IMPORT } from '../actions/importer/index.ts';
import {
  REBLOG_REQUEST,
  REBLOG_FAIL,
  UNREBLOG_REQUEST,
  UNREBLOG_FAIL,
  FAVOURITE_REQUEST,
  UNFAVOURITE_REQUEST,
  FAVOURITE_FAIL,
  DISLIKE_REQUEST,
  UNDISLIKE_REQUEST,
  DISLIKE_FAIL,
} from '../actions/interactions.ts';
import {
  STATUS_CREATE_REQUEST,
  STATUS_CREATE_FAIL,
  STATUS_MUTE_SUCCESS,
  STATUS_UNMUTE_SUCCESS,
  STATUS_REVEAL,
  STATUS_HIDE,
  STATUS_DELETE_REQUEST,
  STATUS_DELETE_FAIL,
  STATUS_TRANSLATE_SUCCESS,
  STATUS_TRANSLATE_UNDO,
  STATUS_UNFILTER,
} from '../actions/statuses.ts';
import { TIMELINE_DELETE } from '../actions/timelines.ts';

import type { APIEntity } from '@/types/entities.ts';
import type { AnyAction } from 'redux';

const domParser = new DOMParser();

type StatusRecord = ReturnType<typeof normalizeStatus>;
type APIEntities = Array<APIEntity>;

type State = Record<string, ReducerStatus>;

export interface ReducerStatus extends Omit<StatusRecord, 'reblog' | 'poll' | 'quote'> {
  reblog: string | null;
  poll: string | null;
  quote: string | null;
}

/** Replace an embedded entity with its ID, keeping an existing ID if it has none. */
const minifyEmbedded = (entity: unknown): string | null => {
  if (typeof entity === 'string') return entity;
  return normalizeId((entity as { id?: unknown } | null)?.id);
};

const minifyStatus = (status: StatusRecord): ReducerStatus => {
  return {
    ...status,
    reblog: minifyEmbedded(status.reblog),
    poll: minifyEmbedded(status.poll),
    quote: minifyEmbedded(status.quote),
  };
};

// Gets titles of poll options from status
const getPollOptionTitles = ({ poll }: StatusRecord): readonly string[] => {
  if (poll && typeof poll === 'object') {
    return poll.options.map(({ title }) => title);
  } else {
    return [];
  }
};

// Gets usernames of mentioned users from status
const getMentionedUsernames = (status: StatusRecord): string[] => {
  return status.mentions.map(({ acct }) => `@${acct}`);
};

// Creates search text from the status
const buildSearchContent = (status: StatusRecord): string => {
  const pollOptionTitles = getPollOptionTitles(status);
  const mentionedUsernames = getMentionedUsernames(status);

  const fields = [
    status.spoiler_text,
    status.content,
    ...pollOptionTitles,
    ...mentionedUsernames,
  ];

  return htmlToPlaintext(fields.join('\n\n')) || '';
};

// Only calculate these values when status first encountered
// Otherwise keep the ones already in the reducer
export const calculateStatus = (
  status: StatusRecord,
  expandSpoilers: boolean = false,
): StatusRecord => {
  const searchContent = buildSearchContent(status);

  return {
    ...status,
    search_index: domParser.parseFromString(searchContent, 'text/html').documentElement.textContent || '',
    content: DOMPurify.sanitize(stripCompatibilityFeatures(status.content), { USE_PROFILES: { html: true } }),
    // `spoiler_text` alone is a subject line; it only warrants hiding the post
    // when the author also marked it sensitive.
    hidden: expandSpoilers ? false : status.sensitive,
  };
};

// Check whether a status is a quote by secondary characteristics
const isQuote = (status: StatusRecord) => {
  return Boolean(status.pleroma.quote_url);
};

// Preserve translation if an existing status already has it
const fixTranslation = (status: StatusRecord, oldStatus?: ReducerStatus): StatusRecord => {
  if (oldStatus?.translation && !status.translation) {
    return { ...status, translation: oldStatus.translation };
  } else {
    return status;
  }
};

// Preserve quote if an existing status already has it
const fixQuote = (status: StatusRecord, oldStatus?: ReducerStatus): StatusRecord => {
  if (oldStatus && !status.quote && isQuote(status)) {
    return {
      ...status,
      quote: oldStatus.quote,
      pleroma: {
        ...status.pleroma,
        quote_visible: status.pleroma.quote_visible || oldStatus.pleroma.quote_visible,
      },
    };
  } else {
    return status;
  }
};

const fixStatus = (state: State, data: APIEntity, expandSpoilers: boolean): ReducerStatus => {
  const oldStatus = state[data.id];

  let status = normalizeStatus(data);
  status = fixTranslation(status, oldStatus);
  status = fixQuote(status, oldStatus);
  status = calculateStatus(status, expandSpoilers);
  return minifyStatus(status);
};

const importStatuses = (state: State, statuses: APIEntities, expandSpoilers: boolean): State =>
  produce(state, draft => {
    statuses.forEach(status => {
      draft[status.id] = fixStatus(state, status, expandSpoilers);
    });
  });

const deleteStatus = (draft: Draft<State>, id: string, references: Array<string>) => {
  references.forEach(ref => {
    deleteStatus(draft, ref[0], []);
  });

  delete draft[id];
};

const incrementReplyCount = (draft: Draft<State>, { in_reply_to_id }: APIEntity) => {
  const parent = in_reply_to_id ? draft[in_reply_to_id] : undefined;
  if (parent) {
    parent.replies_count = typeof parent.replies_count === 'number' ? parent.replies_count + 1 : 0;
  }
};

const decrementReplyCount = (draft: Draft<State>, { in_reply_to_id }: APIEntity) => {
  const parent = in_reply_to_id ? draft[in_reply_to_id] : undefined;
  if (parent) {
    parent.replies_count = typeof parent.replies_count === 'number' ? Math.max(0, parent.replies_count - 1) : 0;
  }
};

/** Simulate favourite/unfavourite of status for optimistic interactions */
const simulateFavourite = (
  draft: Draft<State>,
  statusId: string,
  favourited: boolean,
) => {
  const status = draft[statusId];
  if (!status) return;

  const delta = favourited ? +1 : -1;

  status.favourited = favourited;
  status.favourites_count = Math.max(0, status.favourites_count + delta);
};

/** Simulate dislike/undislike of status for optimistic interactions */
const simulateDislike = (
  draft: Draft<State>,
  statusId: string,
  disliked: boolean,
) => {
  const status = draft[statusId];
  if (!status) return;

  const delta = disliked ? +1 : -1;

  status.disliked = disliked;
  status.dislikes_count = Math.max(0, status.dislikes_count + delta);
};

interface Translation {
  content: string;
  detected_source_language: string;
  provider: string;
}

/** Import translation from translation service into the store. */
const importTranslation = (draft: Draft<State>, statusId: string, translation: Translation) => {
  const status = draft[statusId];
  if (!status) return;

  status.translation = {
    ...translation,
    content: stripCompatibilityFeatures(translation.content ?? ''),
  };
};

/** Update a single status in the store, if it exists. */
const updateStatus = (state: State, id: string, recipe: (status: Draft<ReducerStatus>) => void): State => {
  if (!state[id]) return state;

  return produce(state, draft => {
    recipe(draft[id]!);
  });
};

const initialState: State = {};

export default function statuses(state = initialState, action: AnyAction): State {
  switch (action.type) {
    case STATUS_IMPORT:
      return importStatuses(state, [action.status], action.expandSpoilers);
    case STATUSES_IMPORT:
      return importStatuses(state, action.statuses, action.expandSpoilers);
    case STATUS_CREATE_REQUEST:
      return action.editing ? state : produce(state, draft => incrementReplyCount(draft, action.params));
    case STATUS_CREATE_FAIL:
      return action.editing ? state : produce(state, draft => decrementReplyCount(draft, action.params));
    case FAVOURITE_REQUEST:
      return produce(state, draft => simulateFavourite(draft, action.status.id, true));
    case UNFAVOURITE_REQUEST:
      return produce(state, draft => simulateFavourite(draft, action.status.id, false));
    case DISLIKE_REQUEST:
      return produce(state, draft => simulateDislike(draft, action.status.id, true));
    case UNDISLIKE_REQUEST:
      return produce(state, draft => simulateDislike(draft, action.status.id, false));
    case EMOJI_REACT_REQUEST:
      return updateStatus(state, action.status.id, status => {
        status.reactions = simulateEmojiReact(status.reactions ?? [], action.emoji, action.custom);
      });
    case UNEMOJI_REACT_REQUEST:
      return updateStatus(state, action.status.id, status => {
        status.reactions = simulateUnEmojiReact(status.reactions ?? [], action.emoji);
      });
    case FAVOURITE_FAIL:
      return updateStatus(state, action.status.id, status => {
        status.favourited = false;
      });
    case DISLIKE_FAIL:
      return updateStatus(state, action.status.id, status => {
        status.disliked = false;
      });
    case REBLOG_REQUEST:
    case UNREBLOG_FAIL:
      return updateStatus(state, action.status.id, status => {
        status.reblogged = true;
      });
    case REBLOG_FAIL:
    case UNREBLOG_REQUEST:
      return updateStatus(state, action.status.id, status => {
        status.reblogged = false;
      });
    case BOOKMARK_REQUEST:
    case UNBOOKMARK_FAIL:
      return updateStatus(state, action.status.id, status => {
        status.bookmarked = true;
      });
    case BOOKMARK_FAIL:
    case UNBOOKMARK_REQUEST:
      return updateStatus(state, action.status.id, status => {
        status.bookmarked = false;
      });
    case STATUS_MUTE_SUCCESS:
      return updateStatus(state, action.id, status => {
        status.muted = true;
      });
    case STATUS_UNMUTE_SUCCESS:
      return updateStatus(state, action.id, status => {
        status.muted = false;
      });
    case STATUS_REVEAL:
    case STATUS_HIDE:
      return produce(state, draft => {
        action.ids.forEach((id: string) => {
          const status = draft[id];
          if (status) {
            status.hidden = action.type === STATUS_HIDE;
          }
        });
      });
    case STATUS_DELETE_REQUEST:
      return produce(state, draft => decrementReplyCount(draft, action.params));
    case STATUS_DELETE_FAIL:
      return produce(state, draft => incrementReplyCount(draft, action.params));
    case STATUS_TRANSLATE_SUCCESS:
      return produce(state, draft => importTranslation(draft, action.id, action.translation));
    case STATUS_TRANSLATE_UNDO:
      return updateStatus(state, action.id, status => {
        status.translation = null;
      });
    case STATUS_UNFILTER:
      return updateStatus(state, action.id, status => {
        status.showFiltered = false;
      });
    case TIMELINE_DELETE:
      return produce(state, draft => deleteStatus(draft, action.id, action.references));
    case EVENT_JOIN_REQUEST:
      return updateStatus(state, action.id, status => {
        if (status.event) status.event.join_state = 'pending';
      });
    case EVENT_JOIN_FAIL:
    case EVENT_LEAVE_REQUEST:
      return updateStatus(state, action.id, status => {
        if (status.event) status.event.join_state = null;
      });
    case EVENT_LEAVE_FAIL:
      return updateStatus(state, action.id, status => {
        if (status.event) status.event.join_state = action.previousState;
      });
    default:
      return state;
  }
}
