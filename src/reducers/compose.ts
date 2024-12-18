import { Map as ImmutableMap, OrderedSet as ImmutableOrderedSet, fromJS } from 'immutable';

import { isNativeEmoji } from 'soapbox/features/emoji/index.ts';
import { Account } from 'soapbox/schemas/index.ts';
import { tagHistory } from 'soapbox/settings.ts';
import { PLEROMA } from 'soapbox/utils/features.ts';
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

const PollRecord = {
  options: ['', ''],
  expires_in: 24 * 3600,
  multiple: false,
};

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
  suggestions: string[] | Emoji[];
  suggestion_token: string | null;
  tagHistory: string[];
  text: string;
  to: string[];
  group_timeline_visible: boolean; // TruthSocial
}

export const initialCompose: Compose = {
  caretPosition: null,
  content_type: 'text/plain',
  editorState: null,
  focusDate: null,
  group_id: null,
  idempotencyKey: crypto.randomUUID(),
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
  group_timeline_visible: false, // TruthSocial
};


type State = Record<string, Compose>;
type Poll = {
  options: string[];
  expires_in: number;
  multiple: boolean;
};
type Path = Array<string | number>;

const statusToTextMentions = (status: Status, account: Account) => {
  const author = status.account.acct;
  const mentions = status.mentions?.map((m) => m.acct) || [];

  const textMentions = new Set([author, ...mentions]);

  textMentions.delete(account.acct);

  const updatedTextMentions = Array.from(textMentions).map(m => `@${m}`).join('');

  return updatedTextMentions;
};

export const statusToMentionsArray = (status: Status, account: Account) => {
  const author = status.account.acct as string;
  const mentions = status.mentions?.map((m) => m.acct) || [];

  const mentionsSet = [author, ...mentions];

  const updatedArray = mentionsSet.filter(item => item !== account.acct);

  return updatedArray;
};

export const statusToMentionsAccountIdsArray = (status: StatusEntity, account: Account) => {
  const mentions = status.mentions.map((m) => m.id);

  return ImmutableOrderedSet<string>([account.id])
    .concat(mentions)
    .delete(account.id);
};

const appendMedia = (compose: Compose, media: APIEntity, defaultSensitive?: boolean) => {
  const prevSize = compose.media_attachments.length;

  return {
    ...compose,
    media_attachments: [...compose.media_attachments, normalizeAttachment(media)],
    is_uploading: false,
    resetFileKey: Math.floor((Math.random() * 0x10000)),
    idempotencyKey: crypto.randomUUID(),
    sensitive: (prevSize === 0 && (defaultSensitive || compose.spoiler)) ? true : compose.sensitive,
  };
};

const removeMedia = (compose: Compose, mediaId: string) => {
  const prevSize = compose.media_attachments.length;

  return {
    ...compose,
    media_attachments: compose.media_attachments.filter(item => item.id !== mediaId),
    idempotencyKey: crypto.randomUUID(),
    sensitive: prevSize === 1 ? false : compose.sensitive,
  };
};

const insertSuggestion = (compose: Compose, position: number, token: string | null, completion: string, path: Array<string | number>) => {
  const prevCompose = { ...compose };

  const updateInPath = (obj: any, path: Path, updateFn: (value: any) => any): any => {
    if (path.length === 0) return updateFn(obj);

    const [head, ...tail] = path;
    if (Array.isArray(obj[head])) {
      return [
        ...obj[head].map((item: any, index: number) =>
          index === tail[0] ? updateInPath(item, tail, updateFn) : item,
        ),
      ];
    } else {
      return {
        ...obj,
        [head]: updateInPath(obj[head], tail, updateFn),
      };
    }
  };

  if (path.length === 1 && path[0] === 'text') {
    const oldText = prevCompose.text || '';
    const updatedText = `${oldText.slice(0, position)}${completion} ${oldText.slice(position + (token?.length ?? 0))}`;

    prevCompose.text = updatedText;
    prevCompose.focusDate = new Date();
    prevCompose.caretPosition = position + completion.length + 1;
  }

  prevCompose.suggestion_token = null;
  prevCompose.suggestions = [];
  prevCompose.idempotencyKey = crypto.randomUUID();

  prevCompose.text = updateInPath(prevCompose.text, path, oldText => `${oldText.slice(0, position)}${completion} ${(oldText as string).slice(position + (token?.length ?? 0))}`);

  return prevCompose;
};

const updateSuggestionTags = (compose: Compose, token: string, tags: Tag[]) => {
  const prefix = token.slice(1);

  return {
    ...compose,
    suggestions: tags
      .filter((tag) => tag.get('name').toLowerCase().startsWith(prefix.toLowerCase()))
      .slice(0, 4)
      .map((tag) => '#' + tag.name),
    suggestion_token: token,
  };
};

const insertEmoji = (compose: Compose, position: number, emojiData: Emoji, needsSpace: boolean) => {
  const oldText = compose.text;
  const emojiText = isNativeEmoji(emojiData) ? emojiData.native : emojiData.colons;
  const emoji = needsSpace ? ' ' + emojiText : emojiText;

  return {
    ...compose,
    text: `${oldText.slice(0, position)}${emoji} ${oldText.slice(position)}`,
    focusDate: new Date(),
    caretPosition: position + emoji.length + 1,
    idempotencyKey: crypto.randomUUID(),
  };
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
  const fragment = domParser.parseFromString(status.content, 'text/html').documentElement;

  const mentions = status
    .mentions
    .filter((mention) => !(fragment.querySelector(`a[href="${mention.url}"]`) || mention.id === me))
    .map((m) => m.acct);

  return mentions.toJS();
};

const getAccountSettings = (account: ImmutableMap<string, any>) => {
  return account.getIn(['pleroma', 'settings_store', FE_NAME], ImmutableMap()) as ImmutableMap<string, any>;
};

const importAccount = (compose: Compose, account: APIEntity) => {
  const settings = getAccountSettings(ImmutableMap(fromJS(account)));

  const defaultPrivacy = settings.get('defaultPrivacy');
  const defaultContentType = settings.get('defaultContentType');

  return {
    ...compose,
    privacy: defaultPrivacy ?? compose.privacy,
    content_type: defaultContentType ?? compose.content_type,
    tagHistory: tagHistory.get(account.id) || compose.tagHistory,
  };
};

const updateSetting = (compose: Compose, path: string[], value: string) => {
  const pathString = path.join(',');
  switch (pathString) {
    case 'defaultPrivacy':
      return { ...compose, privacy: value };
    case 'defaultContentType':
      return { ...compose, content_type: value };
    default:
      return compose;
  }
};

const updateCompose = (state: State, key: string, updater: (compose: Compose) => Compose) => {
  const defaultCompose = state.default;
  const currentCompose = state[key] || defaultCompose;

  return {
    ...state,
    [key]: updater(currentCompose),
  };
};

export const initialState: State = {
  default: initialCompose,
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
      return updateCompose(state, action.id, compose => {
        return {
          ...compose,
          spoiler_text: action.text,
          idempotencyKey: crypto.randomUUID(),
        };
      });
    case COMPOSE_VISIBILITY_CHANGE:
      return updateCompose(state, action.id, compose => {
        return {
          ...compose,
          privacy: action.value,
          idempotencyKey: crypto.randomUUID(),
        };
      });
    case COMPOSE_CHANGE:
      return updateCompose(state, action.id, compose => {
        return {
          ...compose,
          text: action.text,
          idempotencyKey: crypto.randomUUID(),
        };
      });
    case COMPOSE_REPLY:
      return updateCompose(state, action.id, compose => {
        const defaultCompose = state.default;

        const updatedCompose = {
          ...compose,
          group_id: action.status.group?.id as string,
          in_reply_to: action.status.id,
          to: action.explicitAddressing ? statusToMentionsArray(action.status, action.account) : [] as string[],
          text: !action.explicitAddressing ? statusToTextMentions(action.status, action.account) : '',
          privacy: privacyPreference(action.status.visibility, defaultCompose.privacy),
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
        const author = action.status.account.acct as string;
        const defaultCompose = state.default;

        let updatedCompose = {
          ...compose,
          quote: action.status.id,
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
          if (action.status.group?.group_visibility === 'everyone') {
            updatedCompose = {
              ...updatedCompose,
              privacy: privacyPreference('public', defaultCompose.privacy),
            };
          } else if (action.status.group?.group_visibility === 'members_only') {
            updatedCompose = {
              ...updatedCompose,
              group_id: action.status.group?.id as string,
              privacy: 'group',
            };
          }
        }

        return updatedCompose;

      });
    case COMPOSE_SUBMIT_REQUEST:
      return updateCompose(state, action.id, compose => {
        return {
          ...compose,
          is_submitting: true,
        };
      });
    case COMPOSE_UPLOAD_CHANGE_REQUEST:
      return updateCompose(state, action.id, compose => {
        return {
          ...compose,
          is_changing_upload: true,
        };
      });
    case COMPOSE_REPLY_CANCEL:
    case COMPOSE_QUOTE_CANCEL:
    case COMPOSE_RESET:
    case COMPOSE_SUBMIT_SUCCESS:
      return updateCompose(state, action.id, () => {
        let updatedState = {
          ...state.default,
          idempotencyKey: crypto.randomUUID(),
          in_reply_to: action.id.startsWith('reply:') ? action.id.slice(6) : null,
        };

        if (action.id.startsWith('group:')) {
          updatedState = {
            ...updatedState,
            privacy: 'group',
            group_id: action.id.slice(6),
          };
        }

        return  updatedState;
      });
    case COMPOSE_SUBMIT_FAIL:
      return updateCompose(state, action.id, compose => ({ ...compose, is_submitting: false }),
      );
    case COMPOSE_UPLOAD_CHANGE_FAIL:
      return updateCompose(state, action.composeId, compose => ({ ...compose, is_changing_upload: false }));
    case COMPOSE_UPLOAD_REQUEST:
      return updateCompose(state, action.id, compose => ({ ...compose, is_uploading: true }));
    case COMPOSE_UPLOAD_SUCCESS:
      return updateCompose(state, action.id, compose => appendMedia(compose, action.media, state.default.sensitive));
    case COMPOSE_UPLOAD_FAIL:
      return updateCompose(state, action.id, compose => ({ ...compose, is_uploading: false }));
    case COMPOSE_UPLOAD_UNDO:
      return updateCompose(state, action.id, compose => removeMedia(compose, action.media_id));
    case COMPOSE_UPLOAD_PROGRESS:
      return updateCompose(state, action.id, compose => ({ ...compose, progress: Math.round((action.loaded / action.total) * 100) }));
    case COMPOSE_MENTION:
      return updateCompose(state, 'compose-modal', compose => ({
        ...compose,
        text: [compose.text.trim(), `@${action.account.acct} `].filter((str) => str.length !== 0).join(' '),
        focusDate: new Date(),
        caretPosition: null,
        idempotencyKey: crypto.randomUUID(),
      }),
      );
    case COMPOSE_DIRECT:
      return updateCompose(state, 'compose-modal', compose => ({
        ...compose,
        text: [compose.text.trim(), `@${action.account.acct} `].filter((str) => str.length !== 0).join(' '),
        privacy: 'direct',
        focusDate: new Date(),
        caretPosition: null,
        idempotencyKey: crypto.randomUUID(),
      }));
    case COMPOSE_GROUP_POST:
      return updateCompose(state, action.id, compose => {
        return {
          ...compose,
          privacy: 'group',
          group_id: action.group_id,
          focusDate: new Date(),
          caretPosition: null,
          idempotencyKey: crypto.randomUUID(),
        };
      });
    case COMPOSE_SUGGESTIONS_CLEAR:
      return updateCompose(state, action.id, compose => ({ ...compose, suggestions: [] as string[],
        suggestion_token: null,
      }));
    case COMPOSE_SUGGESTIONS_READY:
      return updateCompose(state, action.id, compose => (
        {
          ...compose,
          suggestions: action.accounts
            ? action.accounts.map((item: APIEntity): string => item.id)
            : (action.emojis ?? []),
          suggestion_token: action.token,
        }
      ));
    case COMPOSE_SUGGESTION_SELECT:
      return updateCompose(state, action.id, compose => insertSuggestion(compose, action.position, action.token, action.completion, action.path));
    case COMPOSE_SUGGESTION_TAGS_UPDATE:
      return updateCompose(state, action.id, compose => updateSuggestionTags(compose, action.token, action.tags));
    case COMPOSE_TAG_HISTORY_UPDATE:
      return updateCompose(state, action.id, compose => ({ ...compose, tagHistory: action.tags }));
    case TIMELINE_DELETE:
      return updateCompose(state, 'compose-modal', compose => {
        if (action.id === compose.in_reply_to) {
          return { ...compose, in_reply_to: null };
        } if (action.id === compose.quote) {
          return { ...compose, quote: null };
        } else {
          return compose;
        }
      });
    case COMPOSE_EMOJI_INSERT:
      return updateCompose(state, action.id, compose => insertEmoji(compose, action.position, action.emoji, action.needsSpace));
    case COMPOSE_UPLOAD_CHANGE_SUCCESS:
      return updateCompose(state, action.id, compose => ({
        ...compose,
        is_changing_upload: false,
        media_attachments: compose.media_attachments.map(item => {
          if (item.id === action.media.id) {
            return normalizeAttachment(action.media);
          }
          return item;
        }),
      }));
    case COMPOSE_SET_STATUS:
      return updateCompose(state, 'compose-modal', compose => {
        let updatedCompose = {
          ...compose,
          text: action.rawText || htmlToPlaintext(expandMentions(action.status)),
          to: action.explicitAddressing ? getExplicitMentions(action.status.account.id, action.status) : [],
          in_reply_to: action.status.in_reply_to_id,
          privacy: action.status.visibility,
          focusDate: new Date(),
          caretPosition: null,
          idempotencyKey: crypto.randomUUID(),
          content_type: action.contentType || 'text/plain',
          quote: action.status.getIn(['quote', 'id']) as string,
          group_id: action.status.getIn(['group', 'id']) as string,
        };

        if (action.v?.software === PLEROMA && action.withRedraft && hasIntegerMediaIds(action.status.toJS() as any)) {
          updatedCompose = {
            ...updatedCompose,
            media_attachments: [],

          };
        } else {
          updatedCompose = {
            ...updatedCompose,
            media_attachments: action.status.media_attachments.toArray(),
          };
        }

        if (action.status.get('spoiler_text').length > 0) {
          updatedCompose = {
            ...updatedCompose,
            spoiler: true,
            spoiler_text: action.status.spoiler_text,
          };
        } else {
          updatedCompose = {
            ...updatedCompose,
            spoiler: false,
            spoiler_text: '',
          };
        }

        if (action.status.poll && typeof action.status.poll === 'object') {
          updatedCompose = {
            ...updatedCompose,
            poll: {
              ...PollRecord,
              options: action.status.poll.options.map(({ title }) => title),
              multiple: action.status.poll.multiple,
              expires_in: 24 * 3600,
            },
          };
        }
        return updatedCompose;
      });
    case COMPOSE_POLL_ADD:
      return updateCompose(state, action.id, compose => ({ ...compose, poll: { ...PollRecord } }));
    case COMPOSE_POLL_REMOVE:
      return updateCompose(state, action.id, compose => ({ ...compose, poll: null }));
    case COMPOSE_SCHEDULE_ADD:
      return updateCompose(state, action.id, compose => ({ ...compose, schedule: new Date(Date.now() + 10 * 60 * 1000) }));
    case COMPOSE_SCHEDULE_SET:
      return updateCompose(state, action.id, compose => ({ ...compose, schedule: action.date }));
    case COMPOSE_SCHEDULE_REMOVE:
      return updateCompose(state, action.id, compose => ({ ...compose, schedule: null }));
    case COMPOSE_POLL_OPTION_ADD:
      return updateCompose(state, action.id, compose => {
        const updatedPoll = {
          ...compose.poll,
          options: [ ...(compose.poll?.options || ['', '']), action.title ],
          expires_in: compose.poll?.expires_in ?? 24 * 3600,
          multiple: compose.poll?.multiple ?? false,
        };
        return {
          ...compose,
          poll: updatedPoll,
        };
      });
    case COMPOSE_POLL_OPTION_CHANGE:
      return updateCompose(state, action.id, compose => {
        const updatedPoll = {
          ...compose.poll,
          options: (compose.poll?.options || ['', '']).map((option, index) =>
            index === action.index ? action.title : option,
          ),
          expires_in: compose.poll?.expires_in ?? 24 * 3600,
          multiple: compose.poll?.multiple ?? false,
        };

        return {
          ...compose,
          poll: updatedPoll,
        };

      });
    case COMPOSE_POLL_OPTION_REMOVE:
      return updateCompose(state, action.id, compose => {

        const updatedPollOptions = (compose.poll?.options || []).filter((option, index) => index !== action.index);

        return {
          ...compose,
          poll: {
            ...compose.poll,
            options: updatedPollOptions,
            expires_in: compose.poll?.expires_in ?? 24 * 3600,
            multiple: compose.poll?.multiple ?? false,
          },
        };
      });
    case COMPOSE_POLL_SETTINGS_CHANGE:
      return updateCompose(state, action.id, compose => {

        const updatedPoll =  {
          ...compose.poll,
          options: compose.poll?.options ?? ['', ''],
          expires_in: action.expiresIn ?? 24 * 3600,
          multiple: (typeof action.isMultiple === 'boolean') ? action.isMultiple : false,
        };

        return {
          ...compose,
          poll: compose.poll ? updatedPoll : null,
        };
      });
    case COMPOSE_ADD_TO_MENTIONS:
      return updateCompose(state, action.id, compose => ({
        ...compose, to: [...compose.to, action.account],
      }));
    case COMPOSE_REMOVE_FROM_MENTIONS:
      return updateCompose(state, action.id, compose => {
        return {
          ...compose,
          to: compose.to.filter(item => item !== action.account),
        };
      });
    case COMPOSE_SET_GROUP_TIMELINE_VISIBLE:
      return updateCompose(state, action.id, compose => ({ ...compose, group_timeline_visible: action.groupTimelineVisible }));
    case ME_FETCH_SUCCESS:
    case ME_PATCH_SUCCESS:
      return updateCompose(state, 'default', compose => importAccount(compose, action.me));
    case SETTING_CHANGE:
      return updateCompose(state, 'default', compose => updateSetting(compose, action.path, action.value));
    case COMPOSE_EDITOR_STATE_SET:
      return updateCompose(state, action.id, compose => ({ ...compose, editorState: action.editorState as string }));
    case EVENT_COMPOSE_CANCEL:
      return updateCompose(state, 'event-compose-modal', compose => ({ ...compose, text: '' }));
    case EVENT_FORM_SET:
      return updateCompose(state, 'event-compose-modal', compose => ({ ...compose, text: action.text }));
    case COMPOSE_CHANGE_MEDIA_ORDER:
      return updateCompose(state, action.id, compose => {
        const updatedMediaAttachments = [...compose.media_attachments];

        const indexA = updatedMediaAttachments.findIndex(x => x.id === action.a);
        const moveItem = updatedMediaAttachments[indexA];
        const indexB = updatedMediaAttachments.findIndex(x => x.id === action.b);

        updatedMediaAttachments.splice(indexA, 1);
        updatedMediaAttachments.splice(indexB, 0, moveItem);

        return {
          ...compose,
          media_attachments: updatedMediaAttachments,
        };
      });
    default:
      return state;
  }
}
