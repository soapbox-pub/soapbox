import { List as ImmutableList, OrderedSet as ImmutableOrderedSet, fromJS } from 'immutable';

import { isNativeEmoji } from 'soapbox/features/emoji/index.ts';
import { Account } from 'soapbox/schemas/index.ts';
import { tagHistory } from 'soapbox/settings.ts';
import { hasIntegerMediaIds } from 'soapbox/utils/status.ts';

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
  changeMediaOrder,
} from '../actions/compose.ts';
import { EVENT_COMPOSE_CANCEL, EVENT_FORM_SET, type EventsAction } from '../actions/events.ts';
import { ME_FETCH_SUCCESS, ME_PATCH_SUCCESS, MeAction } from '../actions/me.ts';
import { SETTING_CHANGE, FE_NAME, SettingsAction } from '../actions/settings.ts';
import { TIMELINE_DELETE, TimelineAction } from '../actions/timelines.ts';
import { normalizeAttachment } from '../normalizers/attachment.ts';
import { htmlToPlaintext } from '../utils/html.ts';

import type { Emoji } from 'soapbox/features/emoji/index.ts';
import type {
  APIEntity,
  Attachment as AttachmentEntity,
  Status,
  Status as StatusEntity,
  Tag,
} from 'soapbox/types/entities';

const getResetFileKey = () => Math.floor((Math.random() * 0x10000));

interface Poll {
  options: string[];
  expires_in: number;
  multiple: boolean;
}

interface Compose {
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
  suggestions: string[];
  suggestion_token: string | null;
  tagHistory: string[];
  text: string;
  to: string[];
  group_timeline_visible: boolean; // TruthSocial
}

const initialCompose: Compose = {
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
  media_attachments: [] as AttachmentEntity[],
  poll: null,
  privacy: 'public',
  progress: 0,
  quote: null,
  resetFileKey: getResetFileKey(),
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
};

// export const ReducerCompose = ImmutableRecord({
//   caretPosition: null as number | null,
//   content_type: 'text/plain',
//   editorState: null as string | null,
//   focusDate: null as Date | null,
//   group_id: null as string | null,
//   idempotencyKey: '',
//   id: null as string | null,
//   in_reply_to: null as string | null,
//   is_changing_upload: false,
//   is_composing: false,
//   is_submitting: false,
//   is_uploading: false,
//   media_attachments: ImmutableList<AttachmentEntity>(),
//   poll: null as Poll | null,
//   privacy: 'public',
//   progress: 0,
//   quote: null as string | null,
//   resetFileKey: null as number | null,
//   schedule: null as Date | null,
//   sensitive: false,
//   spoiler: false,
//   spoiler_text: '',
//   suggestions: ImmutableList<string>(),
//   suggestion_token: null as string | null,
//   tagHistory: ImmutableList<string>(),
//   text: '',
//   to: ImmutableOrderedSet<string>(),
//   group_timeline_visible: false, // TruthSocial
// });

type State = Record<string, Compose>;
// type Compose = ReturnType<typeof ReducerCompose>;
const PollRecord = (): Poll => ({
  options: ['', ''],
  expires_in: 24 * 3600,
  multiple: false,
});
// type Poll = ReturnType<typeof PollRecord>;

const statusToTextMentions = (status: Status, account: Account) => {
  const author = status.account.acct || '';
  const mentions = (status.mentions || []).map((m) => m.acct);


  const uniqueMentions = Array.from(new Set([author, ...mentions])).filter((m) => m !== account.acct);

  return uniqueMentions.map((m) => `@${m} `).join('');
};

export const statusToMentionsArray = (status: Status, account: Account) => {
  const author = status.account?.acct || '';
  const mentions = (status.mentions || []).map((m) => m.acct);

  const uniqueMentions = Array.from(new Set([author, ...mentions])).filter(
    (m) => m !== account.acct,
  );

  return uniqueMentions;
};

export const statusToMentionsAccountIdsArray = (status: StatusEntity, account: Account) => {
  const mentions = status.mentions.map((m) => m.id);

  return ImmutableOrderedSet<string>([account.id])
    .concat(mentions)
    .delete(account.id);
};

const appendMedia = (compose: Compose, media: APIEntity, defaultSensitive?: boolean) => {
  const prevSize = compose.media_attachments.length;

  const updatedCompose = {
    ...compose,
    media_attachments: [...compose.media_attachments, normalizeAttachment(media)],
    is_uploading: false,
    resetFileKey: Math.floor((Math.random() * 0x10000)),
    idempotencyKey: crypto.randomUUID(),
    sensitive: prevSize === 0 && (defaultSensitive || compose.spoiler) ? true : compose.sensitive,
  };

  return updatedCompose;
};

const removeMedia = (compose: Compose, mediaId: string) => {
  const prevSize = compose.media_attachments.length;

  const updatedCompose = {
    ...compose,
    media_attachments: compose.media_attachments.filter(item => item.id !== mediaId),
    idempotencyKey: crypto.randomUUID(),
    sensitive: prevSize === 1 ? false : compose.sensitive,
  };

  return updatedCompose;
};

const insertSuggestion = (compose: Compose, position: number, token: string | null, completion: string, path: Array<string | number>) => {
  let updatedCompose: Compose = {
    ...compose,
    suggestion_token: null,
    suggestions: [],
    idempotencyKey: crypto.randomUUID(),
  };

  if (path.length > 0) {
    const key = path[0] as keyof Compose;
    const oldText = updatedCompose[key];

    if (typeof oldText === 'string') {
      updatedCompose = {
        ...updatedCompose,
        [key]: `${oldText.slice(0, position)}${completion} ${oldText.slice(position + (token?.length ?? 0))}`,
      };
    }
  }

  if (path.length === 1 && path[0] === 'text') {
    updatedCompose = {
      ...updatedCompose,
      focusDate: new Date(),
      caretPosition: position + completion.length + 1,
    };
  }

  return updatedCompose;
};

const updateSuggestionTags = (compose: Compose, token: string, tags: Tag[]) => {
  const prefix = token.slice(1);

  const updatedCompose = {
    ...compose,
    suggestions: tags
      .filter((tag) => tag.get('name').toLowerCase().startsWith(prefix.toLowerCase()))
      .slice(0, 4)
      .map((tag) => '#' + tag.name),
    suggestion_token: token,
  };

  return updatedCompose;
};

const insertEmoji = (compose: Compose, position: number, emojiData: Emoji, needsSpace: boolean) => {
  const oldText = compose.text;
  const emojiText = isNativeEmoji(emojiData) ? emojiData.native : emojiData.colons;
  const emoji = needsSpace ? ' ' + emojiText : emojiText;

  const updatedCompose = {
    ...compose,
    text: `${oldText.slice(0, position)}${emoji} ${oldText.slice(position)}`,
    focusDate: new Date(),
    caretPosition: position + emoji.length + 1,
    idempotencyKey: crypto.randomUUID(),
  };

  return updatedCompose;
};

const privacyPreference = (a: string, b: string) => {
  const order = ['public', 'unlisted', 'private', 'direct'];

  if (a === 'group') return a;

  return order[Math.max(order.indexOf(a), order.indexOf(b), 0)];
};

const domParser = new DOMParser();

const expandMentions = (status: Status) => {
  const fragment = domParser.parseFromString(status.get('content'), 'text/html').documentElement;

  status.get('mentions').forEach((mention) => {
    const node = fragment.querySelector(`a[href="${mention.get('url')}"]`);
    if (node) node.textContent = `@${mention.get('acct')}`;
  });

  return fragment.innerHTML;
};

const getExplicitMentions = (me: string, status: Status) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(status.content, 'text/html');

  const mentions = status.mentions
    .filter(mention => {
      const isMentionInContent = doc.querySelector(`a[href="${mention.url}"]`);
      return !isMentionInContent && mention.id !== me;
    })
    .map(mention => mention.acct);

  // return ImmutableOrderedSet<string>(mentions);
  return [...new Set(mentions)].sort();
};

const getAccountSettings = (account: ImmutableMap<string, any>) => {
  return account.getIn(['pleroma', 'settings_store', FE_NAME], ImmutableMap()) as ImmutableMap<string, any>;
};

const importAccount = (compose: Compose, account: APIEntity) => {
  const settings = getAccountSettings(ImmutableMap(fromJS(account)));

  const defaultPrivacy = settings.get('defaultPrivacy');
  const defaultContentType = settings.get('defaultContentType');

  return compose.withMutations(compose => {
    if (defaultPrivacy) compose.set('privacy', defaultPrivacy);
    if (defaultContentType) compose.set('content_type', defaultContentType);
    compose.set('tagHistory', ImmutableList(tagHistory.get(account.id)));
  });
};

const updateSetting = (compose: Compose, path: string[], value: string) => {
  const pathString = path.join(',');
  switch (pathString) {
    case 'defaultPrivacy':
      return {
        ...compose,
        privacy: value,
      };
    case 'defaultContentType':
      return {
        ...compose,
        content_type: value,
      };
    default:
      return compose;
  }
};

const updateCompose = (state: State, key: string, updater: (compose: Compose) => Compose) => {
  const defaultState = state.default;
  const currentState = state[key] || defaultState;

  const updatedState = updater(currentState);

  return {
    ...state,
    [key]: updatedState,
  };
};

export const initialState: State = {
  default: {
    ...initialCompose,
    idempotencyKey: crypto.randomUUID(),
    resetFileKey: getResetFileKey(),
  },
};

export default function compose(state = initialState, action: ComposeAction | EventsAction | MeAction | SettingsAction | TimelineAction) {
  switch (action.type) {
    case COMPOSE_TYPE_CHANGE:
      return updateCompose(state, action.id, compose => {
        return {
          ...compose,
          content_type: action.value,
          idempotencyKey: crypto.randomUUID(),
        };
      });
    case COMPOSE_SPOILERNESS_CHANGE:
      return updateCompose(state, action.id, compose => {
        return {
          ...compose,
          spoiler_text: '',
          spoiler: !compose.spoiler,
          sensitive: !compose.spoiler,
          idempotencyKey: crypto.randomUUID(),
        };
      });
    case COMPOSE_SPOILER_TEXT_CHANGE:
      return updateCompose(state, action.id, (compose) => ({
        ...compose,
        spoiler_text: action.text,
        idempotencyKey: crypto.randomUUID(),
      }));

    case COMPOSE_VISIBILITY_CHANGE:
      return updateCompose(state, action.id, (compose) => ({
        ...compose,
        privacy: action.value,
        idempotencyKey: crypto.randomUUID(),
      }));

    case COMPOSE_CHANGE:
      return updateCompose(state, action.id, (compose) => ({
        ...compose,
        text: action.text,
        idempotencyKey: crypto.randomUUID(),
      }));
    case COMPOSE_REPLY:
      return updateCompose(state, action.id, compose => {
        const defaultCompose = state.default;

        const updatedCompose = {
          ...compose,
          group_id: action.status.group?.id || null,
          in_reply_to: action.status.id,
          to: action.explicitAddressing
            ? statusToMentionsArray(action.status, action.account)
            : [],
          text: !action.explicitAddressing
            ? statusToTextMentions(action.status, action.account)
            : '',
          privacy: privacyPreference(
            action.status.visibility,
            defaultCompose.privacy,
          ),
          focusDate: new Date(),
          caretPosition: null,
          idempotencyKey: crypto.randomUUID(),
          content_type: defaultCompose.content_type,
        };

        if (action.preserveSpoilers && action.status.spoiler_text) {
          updatedCompose.spoiler = true;
          updatedCompose.sensitive = true;
          updatedCompose.spoiler_text = action.status.spoiler_text;
        }

        return updatedCompose;
      });
    case COMPOSE_EVENT_REPLY:
      return updateCompose(state, action.id, compose => {
        return {
          ...compose,
          in_reply_to: action.status.id,
          to: statusToMentionsArray(action.status, action.account),
          idempotencyKey: crypto.randomUUID(),
        };
      });
    case COMPOSE_QUOTE:
      return updateCompose(state, 'compose-modal', compose => {
        const author = action.status.account?.acct || '';
        const defaultCompose = state.default;

        const updatedCompose = {
          ...compose,
          quote: action.status.id || '',
          to: [author],
          text: '',
          privacy: privacyPreference(action.status.visibility, defaultCompose.privacy),
          focusDate: new Date(),
          caretPosition: null,
          idempotencyKey: crypto.randomUUID(),
          content_type: defaultCompose.content_type,
          spoiler: false,
          spoiler_text: '',
        };

        if (action.status.visibility === 'group') {
          const groupVisibility = action.status.group?.group_visibility;
          if (groupVisibility === 'everyone') {
            updatedCompose.privacy = privacyPreference('public', defaultCompose.privacy);
          } else if (groupVisibility === 'members_only') {
            updatedCompose.group_id = action.status.group?.id || '';
            updatedCompose.privacy = 'group';
          }
        }

        return updatedCompose;
      });

    case COMPOSE_SUBMIT_REQUEST:
      return updateCompose(state, action.id, compose => ({
        ...compose,
        is_submitting: true,
      }));

    case COMPOSE_UPLOAD_CHANGE_REQUEST:
      return updateCompose(state, action.id, compose => ({
        ...compose,
        is_changing_upload: true,
      }));

    case COMPOSE_REPLY_CANCEL:
    case COMPOSE_QUOTE_CANCEL:
    case COMPOSE_RESET:
    case COMPOSE_SUBMIT_SUCCESS:
      return updateCompose(state, action.id, compose => {
        const updatedCompose = {
          ...state.default,
          idempotencyKey: crypto.randomUUID(),
          in_reply_to: action.id.startsWith('reply:') ? action.id.slice(6) : null,
        };
        if (action.id.startsWith('group:')) {
          updatedCompose.privacy = 'group';
          updatedCompose.group_id = action.id.slice(6);
        }
        return updatedCompose;
      });

    case COMPOSE_SUBMIT_FAIL:
      return updateCompose(state, action.id, compose => ({
        ...compose,
        is_submitting: false,
      }));

    case COMPOSE_UPLOAD_CHANGE_FAIL:
      return updateCompose(state, action.composeId, compose => ({
        ...compose,
        is_changing_upload: false,
      }));

    case COMPOSE_UPLOAD_REQUEST:
      return updateCompose(state, action.id, compose => ({
        ...compose,
        is_uploading: true,
      }));

    case COMPOSE_UPLOAD_SUCCESS:
      return updateCompose(state, action.id, compose => appendMedia(compose, fromJS(action.media), state.default.sensitive));

    case COMPOSE_UPLOAD_FAIL:
      return updateCompose(state, action.id, compose => ({
        ...compose,
        is_uploading: false,
      }));

    case COMPOSE_UPLOAD_UNDO:
      return updateCompose(state, action.id, compose => removeMedia(compose, action.media_id));

    case COMPOSE_UPLOAD_PROGRESS:
      return updateCompose(state, action.id, compose => ({
        ...compose,
        progress: Math.round((action.loaded / action.total) * 100),
      }));

    case COMPOSE_MENTION:
      return updateCompose(state, 'compose-modal', compose => ({
        ...compose,
        text: [compose.text.trim(), `@${action.account.acct} `].filter(str => str.length !== 0).join(' '),
        focusDate: new Date(),
        caretPosition: null,
        idempotencyKey: crypto.randomUUID(),
      }));

    case COMPOSE_DIRECT:
      return updateCompose(state, 'compose-modal', compose => ({
        ...compose,
        text: [compose.text.trim(), `@${action.account.acct} `].filter(str => str.length !== 0).join(' '),
        privacy: 'direct',
        focusDate: new Date(),
        caretPosition: null,
        idempotencyKey: crypto.randomUUID(),
      }));

    case COMPOSE_GROUP_POST:
      return updateCompose(state, action.id, compose => ({
        ...compose,
        privacy: 'group',
        group_id: action.group_id,
        focusDate: new Date(),
        caretPosition: null,
        idempotencyKey: crypto.randomUUID(),
      }));

    case COMPOSE_SUGGESTIONS_CLEAR:
      return updateCompose(state, action.id, compose => ({
        ...compose,
        suggestions: [],
        suggestion_token: null,
      }));

    case COMPOSE_SUGGESTIONS_READY:
      return updateCompose(state, action.id, compose => ({
        ...compose,
        suggestions: action.accounts
          ? action.accounts.map((item: APIEntity) => item.id)
          : action.emojis || [],
        suggestion_token: action.token,
      }));

    case COMPOSE_SUGGESTION_SELECT:
      return updateCompose(state, action.id, compose => insertSuggestion(compose, action.position, action.token, action.completion, action.path));

    case COMPOSE_SUGGESTION_TAGS_UPDATE:
      return updateCompose(state, action.id, compose => updateSuggestionTags(compose, action.token, action.tags));

    case COMPOSE_TAG_HISTORY_UPDATE:
      return updateCompose(state, action.id, compose => ({
        ...compose,
        tagHistory: action.tags,
      }));

    case TIMELINE_DELETE:
      return updateCompose(state, 'compose-modal', compose => {
        if (action.id === compose.in_reply_to) {
          return { ...compose, in_reply_to: null };
        }
        if (action.id === compose.quote) {
          return { ...compose, quote: null };
        }
        return compose;
      });

    case COMPOSE_EMOJI_INSERT:
      return updateCompose(state, action.id, compose => insertEmoji(compose, action.position, action.emoji, action.needsSpace));

    case COMPOSE_UPLOAD_CHANGE_SUCCESS:
      return updateCompose(state, action.id, compose => ({
        ...compose,
        is_changing_upload: false,
        media_attachments: compose.media_attachments.map(item => (item.id === action.media.id ? normalizeAttachment(action.media) : item)),
      }));

    case COMPOSE_SET_STATUS:
      return updateCompose(state, 'compose-modal', compose => {
        const updatedCompose = {
          ...compose,
          id: action.withRedraft ? compose.id : action.status.id,
          text: action.rawText || htmlToPlaintext(expandMentions(action.status)),
          to: action.explicitAddressing
            ? getExplicitMentions(action.status.account.id, action.status)
            : [],
          in_reply_to: action.status.in_reply_to_id,
          privacy: action.status.visibility,
          focusDate: new Date(),
          caretPosition: null,
          idempotencyKey: crypto.randomUUID(),
          content_type: action.contentType || 'text/plain',
          quote: action.status.quote ?? '',
          group_id: action.status.group ? action.status.group.id : '',
          media_attachments: (action.v?.software === 'PLEROMA' && action.withRedraft &&
      hasIntegerMediaIds(action.status.media_attachments))
            ? []
            : action.status.media_attachments,
          spoiler: action.status.spoiler_text.length > 0,
          spoiler_text: action.status.spoiler_text || '',
          poll: action.status.poll && typeof action.status.poll === 'object'
            ? {
              options: action.status.poll.options.map(({ title }) => title),
              multiple: action.status.poll.multiple,
              expires_in: 24 * 3600,
            }
            : null,
        };

        return updatedCompose;
      });
    case COMPOSE_POLL_ADD:
      return updateCompose(state, action.id, compose => ({
        ...compose,
        poll: PollRecord(),
      }));

    case COMPOSE_POLL_REMOVE:
      return updateCompose(state, action.id, compose => ({
        ...compose,
        poll: null,
      }));

    case COMPOSE_SCHEDULE_ADD:
      return updateCompose(state, action.id, compose => ({
        ...compose,
        schedule: new Date(Date.now() + 10 * 60 * 1000),
      }));

    case COMPOSE_SCHEDULE_SET:
      return updateCompose(state, action.id, compose => ({
        ...compose,
        schedule: action.date,
      }));

    case COMPOSE_SCHEDULE_REMOVE:
      return updateCompose(state, action.id, compose => ({
        ...compose,
        schedule: null,
      }));

    case COMPOSE_POLL_OPTION_ADD:
      return updateCompose(state, action.id, (compose) => ({
        ...compose,
        poll: {
          ...compose.poll,
          options: [...(compose.poll?.options || []), action.title],
          expires_in: compose.poll?.expires_in ?? 24 * 3600,
          multiple: compose.poll?.multiple ?? false,
        },
      }));
    case COMPOSE_POLL_OPTION_CHANGE:
      return updateCompose(state, action.id, (compose) => ({
        ...compose,
        poll: {
          ...(compose.poll || PollRecord()),
          options: compose.poll?.options.map((option, index) =>
            index === action.index ? action.title : option,
          ) || [],
        },
      }));

    case COMPOSE_POLL_OPTION_REMOVE:
      return updateCompose(state, action.id, (compose) => ({
        ...compose,
        poll: {
          ...(compose.poll || PollRecord()),
          options: compose.poll?.options.filter((_, index) => index !== action.index) || [],
        },
      }));

    case COMPOSE_POLL_SETTINGS_CHANGE:
      return updateCompose(state, action.id, (compose) => ({
        ...compose,
        poll: {
          ...(compose.poll || PollRecord()),
          expires_in: action.expiresIn ?? compose.poll?.expires_in ?? 24 * 3600,
          multiple: action.isMultiple ?? compose.poll?.multiple ?? false,
        },
      }));

    case COMPOSE_ADD_TO_MENTIONS:
      return updateCompose(state, action.id, compose => ({
        ...compose,
        to: [...compose.to, action.account],
      }));

    case COMPOSE_REMOVE_FROM_MENTIONS:
      return updateCompose(state, action.id, compose => ({
        ...compose,
        to: compose.to.filter(account => account !== action.account),
      }));

    case COMPOSE_SET_GROUP_TIMELINE_VISIBLE:
      return updateCompose(state, action.id, compose => ({
        ...compose,
        group_timeline_visible: action.groupTimelineVisible,
      }));

    case ME_FETCH_SUCCESS:
    case ME_PATCH_SUCCESS:
      return updateCompose(state, 'default', compose => importAccount(compose, action.me));

    case SETTING_CHANGE:
      return updateCompose(state, 'default', compose => updateSetting(compose, action.path, action.value));

    case COMPOSE_EDITOR_STATE_SET:
      return updateCompose(state, action.id, compose => ({
        ...compose,
        editorState: action.editorState as string,
      }));

    case EVENT_COMPOSE_CANCEL:
      return updateCompose(state, 'event-compose-modal', compose => ({
        ...compose,
        text: '',
      }));

    case EVENT_FORM_SET:
      return updateCompose(state, 'event-compose-modal', compose => ({
        ...compose,
        text: action.text,
      }));

    case COMPOSE_CHANGE_MEDIA_ORDER:
      return updateCompose(state, action.id, compose => ({
        ...compose,
        media_attachments: changeMediaOrder(compose.media_attachments.id, action.a, action.b),
      }));

    default:
      return state;
  }
}