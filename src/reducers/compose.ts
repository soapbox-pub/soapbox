import { produce, type Draft } from 'immer';

import { isNativeEmoji } from '@/features/emoji/index.ts';
import { Account } from '@/schemas/index.ts';
import { tagHistory } from '@/settings.ts';
import { PLEROMA } from '@/utils/features.ts';
import { hasIntegerMediaIds } from '@/utils/status.ts';

import { COMPOSE_SET_STATUS } from '../actions/compose-status.ts';
import {
  COMPOSE_CHANGE,
  COMPOSE_REPLY,
  COMPOSE_REPLY_CANCEL,
  COMPOSE_QUOTE,
  COMPOSE_QUOTE_CANCEL,
  COMPOSE_GROUP_POST,
  COMPOSE_DIRECT,
  COMPOSE_MENTION,
  COMPOSE_SUBMIT_REQUEST,
  COMPOSE_SUBMIT_SUCCESS,
  COMPOSE_SUBMIT_FAIL,
  COMPOSE_UPLOAD_REQUEST,
  COMPOSE_UPLOAD_SUCCESS,
  COMPOSE_UPLOAD_FAIL,
  COMPOSE_UPLOAD_UNDO,
  COMPOSE_UPLOAD_PROGRESS,
  COMPOSE_SUGGESTIONS_CLEAR,
  COMPOSE_SUGGESTIONS_READY,
  COMPOSE_SUGGESTION_SELECT,
  COMPOSE_SUGGESTION_TAGS_UPDATE,
  COMPOSE_TAG_HISTORY_UPDATE,
  COMPOSE_SPOILERNESS_CHANGE,
  COMPOSE_TYPE_CHANGE,
  COMPOSE_SPOILER_TEXT_CHANGE,
  COMPOSE_VISIBILITY_CHANGE,
  COMPOSE_EMOJI_INSERT,
  COMPOSE_UPLOAD_CHANGE_REQUEST,
  COMPOSE_UPLOAD_CHANGE_SUCCESS,
  COMPOSE_UPLOAD_CHANGE_FAIL,
  COMPOSE_RESET,
  COMPOSE_POLL_ADD,
  COMPOSE_POLL_REMOVE,
  COMPOSE_SCHEDULE_ADD,
  COMPOSE_SCHEDULE_SET,
  COMPOSE_SCHEDULE_REMOVE,
  COMPOSE_POLL_OPTION_ADD,
  COMPOSE_POLL_OPTION_CHANGE,
  COMPOSE_POLL_OPTION_REMOVE,
  COMPOSE_POLL_SETTINGS_CHANGE,
  COMPOSE_ADD_TO_MENTIONS,
  COMPOSE_REMOVE_FROM_MENTIONS,
  COMPOSE_EVENT_REPLY,
  COMPOSE_EDITOR_STATE_SET,
  COMPOSE_SET_GROUP_TIMELINE_VISIBLE,
  ComposeAction,
  COMPOSE_CHANGE_MEDIA_ORDER,
} from '../actions/compose.ts';
import { EVENT_COMPOSE_CANCEL, EVENT_FORM_SET, type EventsAction } from '../actions/events.ts';
import { ME_FETCH_SUCCESS, ME_PATCH_SUCCESS, MeAction } from '../actions/me.ts';
import { SETTING_CHANGE, FE_NAME, SettingsAction } from '../actions/settings.ts';
import { TIMELINE_DELETE, TimelineAction } from '../actions/timelines.ts';
import { normalizeAttachment } from '../normalizers/attachment.ts';
import { htmlToPlaintext } from '../utils/html.ts';

import type { Emoji } from '@/features/emoji/index.ts';
import type {
  APIEntity,
  Attachment as AttachmentEntity,
  Status,
  Tag,
} from '@/types/entities';

const getResetFileKey = () => Math.floor((Math.random() * 0x10000));

interface Poll {
  options: string[];
  expires_in: number;
  multiple: boolean;
}

const newPoll = (poll: Partial<Poll> = {}): Poll => ({
  options: ['', ''],
  expires_in: 24 * 3600,
  multiple: false,
  ...poll,
});

export interface Compose {
  caretPosition: number | null;
  content_type: string;
  editorState: string | null;
  focusDate: Date | null;
  group_id: string | null;
  idempotencyKey: string;
  id: string | null;
  in_reply_to: string | null;
  is_changing_upload: boolean;
  is_composing: boolean;
  is_submitting: boolean;
  is_uploading: boolean;
  media_attachments: AttachmentEntity[];
  poll: Poll | null;
  privacy: string;
  progress: number;
  quote: string | null;
  resetFileKey: number | null;
  schedule: Date | null;
  sensitive: boolean;
  spoiler: boolean;
  spoiler_text: string;
  suggestions: (string | Emoji)[];
  suggestion_token: string | null;
  tagHistory: string[];
  text: string;
  /** Unique list of accts to address. */
  to: string[];
  group_timeline_visible: boolean; // TruthSocial
}

export const newCompose = (compose: Partial<Compose> = {}): Compose => ({
  caretPosition: null,
  content_type: 'text/plain',
  editorState: null,
  focusDate: null,
  group_id: null,
  idempotencyKey: '',
  id: null,
  in_reply_to: null,
  is_changing_upload: false,
  is_composing: false,
  is_submitting: false,
  is_uploading: false,
  media_attachments: [],
  poll: null,
  privacy: 'public',
  progress: 0,
  quote: null,
  resetFileKey: null,
  schedule: null,
  sensitive: false,
  spoiler: false,
  spoiler_text: '',
  suggestions: [],
  suggestion_token: null,
  tagHistory: [],
  text: '',
  to: [],
  group_timeline_visible: false,
  ...compose,
});

type State = Record<string, Compose>;

/** Build a unique list of accts from the author and mentions, excluding the given acct. */
const uniqueAccts = (accts: string[], exclude: string): string[] => {
  return [...new Set(accts)].filter(acct => acct !== exclude);
};

const statusToTextMentions = (status: Status, account: Account) => {
  const author = status.account?.acct;
  const mentions = status.mentions?.map((m) => m.acct) || [];

  return uniqueAccts([author, ...mentions], account.acct)
    .map(m => `@${m} `)
    .join('');
};

export const statusToMentionsArray = (status: Status, account: Account): string[] => {
  const author = status.account?.acct;
  const mentions = status.mentions?.map((m) => m.acct) || [];

  return uniqueAccts([author, ...mentions], account.acct);
};

export const statusToMentionsAccountIdsArray = (status: Status, account: Account): string[] => {
  const mentions = status.mentions.map((m) => m.id);

  return uniqueAccts([account.id, ...mentions], account.id);
};

const appendMedia = (compose: Draft<Compose>, media: APIEntity, defaultSensitive?: boolean) => {
  const prevSize = compose.media_attachments.length;

  compose.media_attachments.push(normalizeAttachment(media));
  compose.is_uploading = false;
  compose.resetFileKey = Math.floor((Math.random() * 0x10000));
  compose.idempotencyKey = crypto.randomUUID();

  if (prevSize === 0 && (defaultSensitive || compose.spoiler)) {
    compose.sensitive = true;
  }
};

const removeMedia = (compose: Draft<Compose>, mediaId: string) => {
  const prevSize = compose.media_attachments.length;

  compose.media_attachments = compose.media_attachments.filter(item => item.id !== mediaId);
  compose.idempotencyKey = crypto.randomUUID();

  if (prevSize === 1) {
    compose.sensitive = false;
  }
};

const insertSuggestion = (compose: Draft<Compose>, position: number, token: string | null, completion: string, path: Array<string | number>) => {
  const key = path[0] as 'text' | 'spoiler_text';
  const oldText = compose[key];

  compose[key] = `${oldText.slice(0, position)}${completion} ${oldText.slice(position + (token?.length ?? 0))}`;
  compose.suggestion_token = null;
  compose.suggestions = [];
  if (path.length === 1 && path[0] === 'text') {
    compose.focusDate = new Date();
    compose.caretPosition = position + completion.length + 1;
  }
  compose.idempotencyKey = crypto.randomUUID();
};

const updateSuggestionTags = (compose: Draft<Compose>, token: string, tags: Tag[]) => {
  const prefix = token.slice(1);

  compose.suggestions = tags
    .filter((tag) => tag.name.toLowerCase().startsWith(prefix.toLowerCase()))
    .slice(0, 4)
    .map((tag) => '#' + tag.name);
  compose.suggestion_token = token;
};

const insertEmoji = (compose: Draft<Compose>, position: number, emojiData: Emoji, needsSpace: boolean) => {
  const oldText = compose.text;
  const emojiText = isNativeEmoji(emojiData) ? emojiData.native : emojiData.colons;
  const emoji = needsSpace ? ' ' + emojiText : emojiText;

  compose.text = `${oldText.slice(0, position)}${emoji} ${oldText.slice(position)}`;
  compose.focusDate = new Date();
  compose.caretPosition = position + emoji.length + 1;
  compose.idempotencyKey = crypto.randomUUID();
};

const privacyPreference = (a: string, b: string) => {
  const order = ['public', 'unlisted', 'private', 'direct'];

  if (a === 'group') return a;

  return order[Math.max(order.indexOf(a), order.indexOf(b), 0)];
};

const domParser = new DOMParser();

const expandMentions = (status: Status) => {
  const fragment = domParser.parseFromString(status.content, 'text/html').documentElement;

  status.mentions.forEach((mention) => {
    const node = fragment.querySelector(`a[href="${mention.url}"]`);
    if (node) node.textContent = `@${mention.acct}`;
  });

  return fragment.innerHTML;
};

const getExplicitMentions = (me: string, status: Status): string[] => {
  const fragment = domParser.parseFromString(status.content, 'text/html').documentElement;

  const mentions = status
    .mentions
    .filter((mention) => !(fragment.querySelector(`a[href="${mention.url}"]`) || mention.id === me))
    .map((m) => m.acct);

  return [...new Set(mentions)];
};

const getAccountSettings = (account: APIEntity): Record<string, any> => {
  return account?.pleroma?.settings_store?.[FE_NAME] ?? {};
};

const importAccount = (compose: Draft<Compose>, account: APIEntity) => {
  const settings = getAccountSettings(account);

  const defaultPrivacy = settings.defaultPrivacy;
  const defaultContentType = settings.defaultContentType;

  if (defaultPrivacy) compose.privacy = defaultPrivacy;
  if (defaultContentType) compose.content_type = defaultContentType;
  compose.tagHistory = [...(tagHistory.get(account.id) ?? [])];
};

const updateSetting = (compose: Draft<Compose>, path: string[], value: string) => {
  const pathString = path.join(',');
  switch (pathString) {
    case 'defaultPrivacy':
      compose.privacy = value;
      break;
    case 'defaultContentType':
      compose.content_type = value;
      break;
  }
};

/** Update the compose form for the given key, starting from the default form if it doesn't exist. */
const updateCompose = (state: State, key: string, recipe: (compose: Draft<Compose>) => Compose | void): State => ({
  ...state,
  [key]: produce(state[key] ?? state.default, recipe),
});

export const initialState: State = {
  default: newCompose({ idempotencyKey: crypto.randomUUID(), resetFileKey: getResetFileKey() }),
};

export default function compose(state = initialState, action: ComposeAction | EventsAction | MeAction | SettingsAction | TimelineAction): State {
  switch (action.type) {
    case COMPOSE_TYPE_CHANGE:
      return updateCompose(state, action.id, compose => {
        compose.content_type = action.value;
        compose.idempotencyKey = crypto.randomUUID();
      });
    case COMPOSE_SPOILERNESS_CHANGE:
      return updateCompose(state, action.id, compose => {
        compose.spoiler_text = '';
        compose.sensitive = !compose.spoiler;
        compose.spoiler = !compose.spoiler;
        compose.idempotencyKey = crypto.randomUUID();
      });
    case COMPOSE_SPOILER_TEXT_CHANGE:
      return updateCompose(state, action.id, compose => {
        compose.spoiler_text = action.text;
        compose.idempotencyKey = crypto.randomUUID();
      });
    case COMPOSE_VISIBILITY_CHANGE:
      return updateCompose(state, action.id, compose => {
        compose.privacy = action.value;
        compose.idempotencyKey = crypto.randomUUID();
      });
    case COMPOSE_CHANGE:
      return updateCompose(state, action.id, compose => {
        compose.text = action.text;
        compose.idempotencyKey = crypto.randomUUID();
      });
    case COMPOSE_REPLY:
      return updateCompose(state, action.id, compose => {
        const defaultCompose = state.default;

        compose.group_id = action.status.group?.id ?? null;
        compose.in_reply_to = action.status.id;
        compose.to = action.explicitAddressing ? statusToMentionsArray(action.status, action.account) : [];
        compose.text = !action.explicitAddressing ? statusToTextMentions(action.status, action.account) : '';
        compose.privacy = privacyPreference(action.status.visibility, defaultCompose.privacy);
        compose.focusDate = new Date();
        compose.caretPosition = null;
        compose.idempotencyKey = crypto.randomUUID();
        compose.content_type = defaultCompose.content_type;
        if (action.preserveSpoilers && action.status.spoiler_text) {
          compose.spoiler = true;
          compose.sensitive = true;
          compose.spoiler_text = action.status.spoiler_text;
        }
      });
    case COMPOSE_EVENT_REPLY:
      return updateCompose(state, action.id, compose => {
        compose.in_reply_to = action.status.id;
        compose.to = statusToMentionsArray(action.status, action.account);
        compose.idempotencyKey = crypto.randomUUID();
      });
    case COMPOSE_QUOTE:
      return updateCompose(state, 'compose-modal', compose => {
        const author = action.status.account?.acct;
        const defaultCompose = state.default;

        compose.quote = action.status.id;
        compose.to = [author];
        compose.text = '';
        compose.privacy = privacyPreference(action.status.visibility, defaultCompose.privacy);
        compose.focusDate = new Date();
        compose.caretPosition = null;
        compose.idempotencyKey = crypto.randomUUID();
        compose.content_type = defaultCompose.content_type;
        compose.spoiler = false;
        compose.spoiler_text = '';

        if (action.status.visibility === 'group') {
          if (action.status.group?.group_visibility === 'everyone') {
            compose.privacy = privacyPreference('public', defaultCompose.privacy);
          } else if (action.status.group?.group_visibility === 'members_only') {
            compose.group_id = action.status.group?.id ?? null;
            compose.privacy = 'group';
          }
        }
      });
    case COMPOSE_SUBMIT_REQUEST:
      return updateCompose(state, action.id, compose => {
        compose.is_submitting = true;
      });
    case COMPOSE_UPLOAD_CHANGE_REQUEST:
      return updateCompose(state, action.id, compose => {
        compose.is_changing_upload = true;
      });
    case COMPOSE_REPLY_CANCEL:
    case COMPOSE_QUOTE_CANCEL:
    case COMPOSE_RESET:
    case COMPOSE_SUBMIT_SUCCESS:
      return {
        ...state,
        [action.id]: produce(state.default, compose => {
          compose.idempotencyKey = crypto.randomUUID();
          compose.in_reply_to = action.id.startsWith('reply:') ? action.id.slice(6) : null;
          if (action.id.startsWith('group:')) {
            compose.privacy = 'group';
            compose.group_id = action.id.slice(6);
          }
        }),
      };
    case COMPOSE_SUBMIT_FAIL:
      return updateCompose(state, action.id, compose => {
        compose.is_submitting = false;
      });
    case COMPOSE_UPLOAD_CHANGE_FAIL:
      return updateCompose(state, action.composeId, compose => {
        compose.is_changing_upload = false;
      });
    case COMPOSE_UPLOAD_REQUEST:
      return updateCompose(state, action.id, compose => {
        compose.is_uploading = true;
      });
    case COMPOSE_UPLOAD_SUCCESS:
      return updateCompose(state, action.id, compose => appendMedia(compose, action.media, state.default.sensitive));
    case COMPOSE_UPLOAD_FAIL:
      return updateCompose(state, action.id, compose => {
        compose.is_uploading = false;
      });
    case COMPOSE_UPLOAD_UNDO:
      return updateCompose(state, action.id, compose => removeMedia(compose, action.media_id));
    case COMPOSE_UPLOAD_PROGRESS:
      return updateCompose(state, action.id, compose => {
        compose.progress = Math.round((action.loaded / action.total) * 100);
      });
    case COMPOSE_MENTION:
      return updateCompose(state, 'compose-modal', compose => {
        compose.text = [compose.text.trim(), `@${action.account.acct} `].filter((str) => str.length !== 0).join(' ');
        compose.focusDate = new Date();
        compose.caretPosition = null;
        compose.idempotencyKey = crypto.randomUUID();
      });
    case COMPOSE_DIRECT:
      return updateCompose(state, 'compose-modal', compose => {
        compose.text = [compose.text.trim(), `@${action.account.acct} `].filter((str) => str.length !== 0).join(' ');
        compose.privacy = 'direct';
        compose.focusDate = new Date();
        compose.caretPosition = null;
        compose.idempotencyKey = crypto.randomUUID();
      });
    case COMPOSE_GROUP_POST:
      return updateCompose(state, action.id, compose => {
        compose.privacy = 'group';
        compose.group_id = action.group_id;
        compose.focusDate = new Date();
        compose.caretPosition = null;
        compose.idempotencyKey = crypto.randomUUID();
      });
    case COMPOSE_SUGGESTIONS_CLEAR:
      return updateCompose(state, action.id, compose => {
        compose.suggestions = [];
        compose.suggestion_token = null;
      });
    case COMPOSE_SUGGESTIONS_READY:
      return updateCompose(state, action.id, compose => {
        compose.suggestions = action.accounts ? action.accounts.map((item: APIEntity) => item.id) : (action.emojis ?? []);
        compose.suggestion_token = action.token;
      });
    case COMPOSE_SUGGESTION_SELECT:
      return updateCompose(state, action.id, compose => insertSuggestion(compose, action.position, action.token, action.completion, action.path));
    case COMPOSE_SUGGESTION_TAGS_UPDATE:
      return updateCompose(state, action.id, compose => updateSuggestionTags(compose, action.token, action.tags));
    case COMPOSE_TAG_HISTORY_UPDATE:
      return updateCompose(state, action.id, compose => {
        compose.tagHistory = [...action.tags];
      });
    case TIMELINE_DELETE:
      return updateCompose(state, 'compose-modal', compose => {
        if (action.id === compose.in_reply_to) {
          compose.in_reply_to = null;
        } if (action.id === compose.quote) {
          compose.quote = null;
        }
      });
    case COMPOSE_EMOJI_INSERT:
      return updateCompose(state, action.id, compose => insertEmoji(compose, action.position, action.emoji, action.needsSpace));
    case COMPOSE_UPLOAD_CHANGE_SUCCESS:
      return updateCompose(state, action.id, compose => {
        compose.is_changing_upload = false;
        compose.media_attachments = compose.media_attachments.map(item => {
          if (item.id === action.media.id) {
            return normalizeAttachment(action.media);
          }

          return item;
        });
      });
    case COMPOSE_SET_STATUS:
      return updateCompose(state, 'compose-modal', compose => {
        if (!action.withRedraft) {
          compose.id = action.status.id;
        }
        compose.text = action.rawText || htmlToPlaintext(expandMentions(action.status));
        compose.to = action.explicitAddressing ? getExplicitMentions(action.status.account.id, action.status) : [];
        compose.in_reply_to = action.status.in_reply_to_id;
        compose.privacy = action.status.visibility;
        compose.focusDate = new Date();
        compose.caretPosition = null;
        compose.idempotencyKey = crypto.randomUUID();
        compose.content_type = action.contentType || 'text/plain';
        compose.quote = typeof action.status.quote === 'string' ? action.status.quote : action.status.quote?.id ?? null;
        compose.group_id = action.status.group?.id ?? null;

        if (action.v?.software === PLEROMA && action.withRedraft && hasIntegerMediaIds(action.status as any)) {
          compose.media_attachments = [];
        } else {
          compose.media_attachments = action.status.media_attachments;
        }

        if (action.status.spoiler_text.length > 0) {
          compose.spoiler = true;
          compose.spoiler_text = action.status.spoiler_text;
        } else {
          compose.spoiler = false;
          compose.spoiler_text = '';
        }

        if (action.status.poll && typeof action.status.poll === 'object') {
          compose.poll = newPoll({
            options: action.status.poll.options.map(({ title }) => title),
            multiple: action.status.poll.multiple,
            expires_in: 24 * 3600,
          });
        }
      });
    case COMPOSE_POLL_ADD:
      return updateCompose(state, action.id, compose => {
        compose.poll = newPoll();
      });
    case COMPOSE_POLL_REMOVE:
      return updateCompose(state, action.id, compose => {
        compose.poll = null;
      });
    case COMPOSE_SCHEDULE_ADD:
      return updateCompose(state, action.id, compose => {
        compose.schedule = new Date(Date.now() + 10 * 60 * 1000);
      });
    case COMPOSE_SCHEDULE_SET:
      return updateCompose(state, action.id, compose => {
        compose.schedule = action.date;
      });
    case COMPOSE_SCHEDULE_REMOVE:
      return updateCompose(state, action.id, compose => {
        compose.schedule = null;
      });
    case COMPOSE_POLL_OPTION_ADD:
      return updateCompose(state, action.id, compose => {
        compose.poll?.options.push(action.title);
      });
    case COMPOSE_POLL_OPTION_CHANGE:
      return updateCompose(state, action.id, compose => {
        if (compose.poll) compose.poll.options[action.index] = action.title;
      });
    case COMPOSE_POLL_OPTION_REMOVE:
      return updateCompose(state, action.id, compose => {
        compose.poll?.options.splice(action.index, 1);
      });
    case COMPOSE_POLL_SETTINGS_CHANGE:
      return updateCompose(state, action.id, compose => {
        if (!compose.poll) return;
        if (action.expiresIn) {
          compose.poll.expires_in = action.expiresIn;
        }
        if (typeof action.isMultiple === 'boolean') {
          compose.poll.multiple = action.isMultiple;
        }
      });
    case COMPOSE_ADD_TO_MENTIONS:
      return updateCompose(state, action.id, compose => {
        if (!compose.to.includes(action.account)) compose.to.push(action.account);
      });
    case COMPOSE_REMOVE_FROM_MENTIONS:
      return updateCompose(state, action.id, compose => {
        compose.to = compose.to.filter(acct => acct !== action.account);
      });
    case COMPOSE_SET_GROUP_TIMELINE_VISIBLE:
      return updateCompose(state, action.id, compose => {
        compose.group_timeline_visible = action.groupTimelineVisible;
      });
    case ME_FETCH_SUCCESS:
    case ME_PATCH_SUCCESS:
      return updateCompose(state, 'default', compose => importAccount(compose, action.me));
    case SETTING_CHANGE:
      return updateCompose(state, 'default', compose => updateSetting(compose, action.path, action.value));
    case COMPOSE_EDITOR_STATE_SET:
      return updateCompose(state, action.id, compose => {
        compose.editorState = action.editorState as string;
      });
    case EVENT_COMPOSE_CANCEL:
      return updateCompose(state, 'event-compose-modal', compose => {
        compose.text = '';
      });
    case EVENT_FORM_SET:
      return updateCompose(state, 'event-compose-modal', compose => {
        compose.text = action.text;
      });
    case COMPOSE_CHANGE_MEDIA_ORDER:
      return updateCompose(state, action.id, compose => {
        const list = compose.media_attachments;
        const indexA = list.findIndex(x => x.id === action.a);
        const indexB = list.findIndex(x => x.id === action.b);
        const [moveItem] = list.splice(indexA, 1);

        list.splice(indexB, 0, moveItem);
      });
    default:
      return state;
  }
}
