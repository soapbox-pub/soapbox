import escapeTextContentForBrowser from 'escape-html';
import { Map as ImmutableMap, List as ImmutableList } from 'immutable';

import emojify from 'soapbox/features/emoji';
import { normalizeStatus } from 'soapbox/normalizers';
import { simulateEmojiReact, simulateUnEmojiReact } from 'soapbox/utils/emoji-reacts';
import { stripCompatibilityFeatures, unescapeHTML } from 'soapbox/utils/html';
import { makeEmojiMap, normalizeId } from 'soapbox/utils/normalizers';

import {
  EMOJI_REACT_REQUEST,
  UNEMOJI_REACT_REQUEST,
} from '../actions/emoji-reacts';
import {
  EVENT_JOIN_REQUEST,
  EVENT_JOIN_FAIL,
  EVENT_LEAVE_REQUEST,
  EVENT_LEAVE_FAIL,
} from '../actions/events';
import { STATUS_IMPORT, STATUSES_IMPORT } from '../actions/importer';
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
} from '../actions/interactions';
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
} from '../actions/statuses';
import { TIMELINE_DELETE } from '../actions/timelines';

import type { AnyAction } from 'redux';
import type { APIEntity } from 'soapbox/types/entities';

const domParser = new DOMParser();

type StatusRecord = ReturnType<typeof normalizeStatus>;
type APIEntities = Array<APIEntity>;

type State = ImmutableMap<string, ReducerStatus>;

export interface ReducerStatus extends StatusRecord {
  reblog: string | null
  poll: string | null
  quote: string | null
}

const minifyStatus = (status: StatusRecord): ReducerStatus => {
  return status.mergeWith((o, n) => n || o, {
    reblog: normalizeId(status.getIn(['reblog', 'id'])),
    poll: normalizeId(status.getIn(['poll', 'id'])),
    quote: normalizeId(status.getIn(['quote', 'id'])),
  }) as ReducerStatus;
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
const getMentionedUsernames = (status: StatusRecord): ImmutableList<string> => {
  return status.mentions.map(({ acct }) => `@${acct}`);
};

// Creates search text from the status
const buildSearchContent = (status: StatusRecord): string => {
  const pollOptionTitles = getPollOptionTitles(status);
  const mentionedUsernames = getMentionedUsernames(status);

  const fields = ImmutableList([
    status.spoiler_text,
    status.content,
  ]).concat(pollOptionTitles).concat(mentionedUsernames);

  return unescapeHTML(fields.join('\n\n')) || '';
};

// Only calculate these values when status first encountered
// Otherwise keep the ones already in the reducer
export const calculateStatus = (
  status: StatusRecord,
  oldStatus?: StatusRecord,
  expandSpoilers: boolean = false,
): StatusRecord => {
  if (oldStatus && oldStatus.content === status.content && oldStatus.spoiler_text === status.spoiler_text) {
    return status.merge({
      search_index: oldStatus.search_index,
      contentHtml: oldStatus.contentHtml,
      spoilerHtml: oldStatus.spoilerHtml,
      hidden: oldStatus.hidden,
    });
  } else {
    const spoilerText   = status.spoiler_text;
    const searchContent = buildSearchContent(status);
    const emojiMap      = makeEmojiMap(status.emojis);

    return status.merge({
      search_index: domParser.parseFromString(searchContent, 'text/html').documentElement.textContent || '',
      contentHtml: stripCompatibilityFeatures(emojify(status.content, emojiMap)),
      spoilerHtml: emojify(escapeTextContentForBrowser(spoilerText), emojiMap),
      hidden: expandSpoilers ? false : spoilerText.length > 0 || status.sensitive,
    });
  }
};

// Check whether a status is a quote by secondary characteristics
const isQuote = (status: StatusRecord) => {
  return Boolean(status.pleroma.get('quote_url'));
};

// Preserve quote if an existing status already has it
const fixQuote = (status: StatusRecord, oldStatus?: StatusRecord): StatusRecord => {
  if (oldStatus && !status.quote && isQuote(status)) {
    return status
      .set('quote', oldStatus.quote)
      .updateIn(['pleroma', 'quote_visible'], visible => visible || oldStatus.pleroma.get('quote_visible'));
  } else {
    return status;
  }
};

const fixStatus = (state: State, status: APIEntity, expandSpoilers: boolean): ReducerStatus => {
  const oldStatus = state.get(status.id);

  return normalizeStatus(status).withMutations(status => {
    fixQuote(status, oldStatus);
    calculateStatus(status, oldStatus, expandSpoilers);
    minifyStatus(status);
  }) as ReducerStatus;
};

const importStatus = (state: State, status: APIEntity, expandSpoilers: boolean): State =>
  state.set(status.id, fixStatus(state, status, expandSpoilers));

const importStatuses = (state: State, statuses: APIEntities, expandSpoilers: boolean): State =>
  state.withMutations(mutable => statuses.forEach(status => importStatus(mutable, status, expandSpoilers)));

const deleteStatus = (state: State, id: string, references: Array<string>) => {
  references.forEach(ref => {
    state = deleteStatus(state, ref[0], []);
  });

  return state.delete(id);
};

const incrementReplyCount = (state: State, { in_reply_to_id }: APIEntity) => {
  if (in_reply_to_id) {
    return state.updateIn([in_reply_to_id, 'replies_count'], 0, count => {
      return typeof count === 'number' ? count + 1 : 0;
    });
  } else {
    return state;
  }
};

const decrementReplyCount = (state: State, { in_reply_to_id }: APIEntity) => {
  if (in_reply_to_id) {
    return state.updateIn([in_reply_to_id, 'replies_count'], 0, count => {
      return typeof count === 'number' ? Math.max(0, count - 1) : 0;
    });
  } else {
    return state;
  }
};

/** Simulate favourite/unfavourite of status for optimistic interactions */
const simulateFavourite = (
  state: State,
  statusId: string,
  favourited: boolean,
): State => {
  const status = state.get(statusId);
  if (!status) return state;

  const delta = favourited ? +1 : -1;

  const updatedStatus = status.merge({
    favourited,
    favourites_count: Math.max(0, status.favourites_count + delta),
  });

  return state.set(statusId, updatedStatus);
};

/** Simulate dislike/undislike of status for optimistic interactions */
const simulateDislike = (
  state: State,
  statusId: string,
  disliked: boolean,
): State => {
  const status = state.get(statusId);
  if (!status) return state;

  const delta = disliked ? +1 : -1;

  const updatedStatus = status.merge({
    disliked,
    dislikes_count: Math.max(0, status.dislikes_count + delta),
  });

  return state.set(statusId, updatedStatus);
};

interface Translation {
  content: string
  detected_source_language: string
  provider: string
}

/** Import translation from translation service into the store. */
const importTranslation = (state: State, statusId: string, translation: Translation) => {
  const map = ImmutableMap(translation);
  const result = map.set('content', stripCompatibilityFeatures(map.get('content', '')));
  return state.setIn([statusId, 'translation'], result);
};

/** Delete translation from the store. */
const deleteTranslation = (state: State, statusId: string) => {
  return state.deleteIn([statusId, 'translation']);
};

const initialState: State = ImmutableMap();

export default function statuses(state = initialState, action: AnyAction): State {
  switch (action.type) {
    case STATUS_IMPORT:
      return importStatus(state, action.status, action.expandSpoilers);
    case STATUSES_IMPORT:
      return importStatuses(state, action.statuses, action.expandSpoilers);
    case STATUS_CREATE_REQUEST:
      return action.editing ? state : incrementReplyCount(state, action.params);
    case STATUS_CREATE_FAIL:
      return action.editing ? state : decrementReplyCount(state, action.params);
    case FAVOURITE_REQUEST:
      return simulateFavourite(state, action.status.id, true);
    case UNFAVOURITE_REQUEST:
      return simulateFavourite(state, action.status.id, false);
    case DISLIKE_REQUEST:
      return simulateDislike(state, action.status.id, true);
    case UNDISLIKE_REQUEST:
      return simulateDislike(state, action.status.id, false);
    case EMOJI_REACT_REQUEST:
      return state
        .updateIn(
          [action.status.id, 'pleroma', 'emoji_reactions'],
          emojiReacts => simulateEmojiReact(emojiReacts as any, action.emoji, action.custom),
        );
    case UNEMOJI_REACT_REQUEST:
      return state
        .updateIn(
          [action.status.id, 'pleroma', 'emoji_reactions'],
          emojiReacts => simulateUnEmojiReact(emojiReacts as any, action.emoji),
        );
    case FAVOURITE_FAIL:
      return state.get(action.status.id) === undefined ? state : state.setIn([action.status.id, 'favourited'], false);
    case DISLIKE_FAIL:
      return state.get(action.status.id) === undefined ? state : state.setIn([action.status.id, 'disliked'], false);
    case REBLOG_REQUEST:
      return state.setIn([action.status.id, 'reblogged'], true);
    case REBLOG_FAIL:
      return state.get(action.status.id) === undefined ? state : state.setIn([action.status.id, 'reblogged'], false);
    case UNREBLOG_REQUEST:
      return state.setIn([action.status.id, 'reblogged'], false);
    case UNREBLOG_FAIL:
      return state.get(action.status.id) === undefined ? state : state.setIn([action.status.id, 'reblogged'], true);
    case STATUS_MUTE_SUCCESS:
      return state.setIn([action.id, 'muted'], true);
    case STATUS_UNMUTE_SUCCESS:
      return state.setIn([action.id, 'muted'], false);
    case STATUS_REVEAL:
      return state.withMutations(map => {
        action.ids.forEach((id: string) => {
          if (!(state.get(id) === undefined)) {
            map.setIn([id, 'hidden'], false);
          }
        });
      });
    case STATUS_HIDE:
      return state.withMutations(map => {
        action.ids.forEach((id: string) => {
          if (!(state.get(id) === undefined)) {
            map.setIn([id, 'hidden'], true);
          }
        });
      });
    case STATUS_DELETE_REQUEST:
      return decrementReplyCount(state, action.params);
    case STATUS_DELETE_FAIL:
      return incrementReplyCount(state, action.params);
    case STATUS_TRANSLATE_SUCCESS:
      return importTranslation(state, action.id, action.translation);
    case STATUS_TRANSLATE_UNDO:
      return deleteTranslation(state, action.id);
    case STATUS_UNFILTER:
      return state.setIn([action.id, 'showFiltered'], false);
    case TIMELINE_DELETE:
      return deleteStatus(state, action.id, action.references);
    case EVENT_JOIN_REQUEST:
      return state.setIn([action.id, 'event', 'join_state'], 'pending');
    case EVENT_JOIN_FAIL:
    case EVENT_LEAVE_REQUEST:
      return state.setIn([action.id, 'event', 'join_state'], null);
    case EVENT_LEAVE_FAIL:
      return state.setIn([action.id, 'event', 'join_state'], action.previousState);
    default:
      return state;
  }
}
