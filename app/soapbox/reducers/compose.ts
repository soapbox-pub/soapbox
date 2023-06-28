import { Map as ImmutableMap, List as ImmutableList, OrderedSet as ImmutableOrderedSet, Record as ImmutableRecord, fromJS } from 'immutable';
import { v4 as uuid } from 'uuid';

import { isNativeEmoji } from 'soapbox/features/emoji';
import { Account } from 'soapbox/schemas';
import { tagHistory } from 'soapbox/settings';
import { PLEROMA } from 'soapbox/utils/features';
import { hasIntegerMediaIds } from 'soapbox/utils/status';

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
  COMPOSE_SET_STATUS,
  COMPOSE_EVENT_REPLY,
  COMPOSE_SET_GROUP_TIMELINE_VISIBLE,
  ComposeAction,
} from '../actions/compose';
import { ME_FETCH_SUCCESS, ME_PATCH_SUCCESS, MeAction } from '../actions/me';
import { SETTING_CHANGE, FE_NAME, SettingsAction } from '../actions/settings';
import { TIMELINE_DELETE, TimelineAction } from '../actions/timelines';
import { normalizeAttachment } from '../normalizers/attachment';
import { unescapeHTML } from '../utils/html';

import type { Emoji } from 'soapbox/features/emoji';
import type {
  APIEntity,
  Attachment as AttachmentEntity,
  Status,
  Status as StatusEntity,
  Tag,
} from 'soapbox/types/entities';

const getResetFileKey = () => Math.floor((Math.random() * 0x10000));

const PollRecord = ImmutableRecord({
  options: ImmutableList(['', '']),
  expires_in: 24 * 3600,
  multiple: false,
});

export const ReducerCompose = ImmutableRecord({
  caretPosition: null as number | null,
  content_type: 'text/plain',
  focusDate: null as Date | null,
  group_id: null as string | null,
  idempotencyKey: '',
  id: null as string | null,
  in_reply_to: null as string | null,
  is_changing_upload: false,
  is_composing: false,
  is_submitting: false,
  is_uploading: false,
  media_attachments: ImmutableList<AttachmentEntity>(),
  poll: null as Poll | null,
  privacy: 'public',
  progress: 0,
  quote: null as string | null,
  resetFileKey: null as number | null,
  schedule: null as Date | null,
  sensitive: false,
  spoiler: false,
  spoiler_text: '',
  suggestions: ImmutableList<string>(),
  suggestion_token: null as string | null,
  tagHistory: ImmutableList<string>(),
  text: '',
  to: ImmutableOrderedSet<string>(),
  group_timeline_visible: false, // TruthSocial
});

type State = ImmutableMap<string, Compose>;
type Compose = ReturnType<typeof ReducerCompose>;
type Poll = ReturnType<typeof PollRecord>;

const statusToTextMentions = (status: Status, account: Account) => {
  const author = status.getIn(['account', 'acct']);
  const mentions = status.get('mentions')?.map((m) => m.acct) || [];

  return ImmutableOrderedSet([author])
    .concat(mentions)
    .delete(account.acct)
    .map(m => `@${m} `)
    .join('');
};

export const statusToMentionsArray = (status: Status, account: Account) => {
  const author = status.getIn(['account', 'acct']) as string;
  const mentions = status.get('mentions')?.map((m) => m.acct) || [];

  return ImmutableOrderedSet<string>([author])
    .concat(mentions)
    .delete(account.acct) as ImmutableOrderedSet<string>;
};

export const statusToMentionsAccountIdsArray = (status: StatusEntity, account: Account) => {
  const mentions = status.mentions.map((m) => m.id);

  return ImmutableOrderedSet<string>([account.id])
    .concat(mentions)
    .delete(account.id);
};

const appendMedia = (compose: Compose, media: APIEntity, defaultSensitive?: boolean) => {
  const prevSize = compose.media_attachments.size;

  return compose.withMutations(map => {
    map.update('media_attachments', list => list.push(normalizeAttachment(media)));
    map.set('is_uploading', false);
    map.set('resetFileKey', Math.floor((Math.random() * 0x10000)));
    map.set('idempotencyKey', uuid());

    if (prevSize === 0 && (defaultSensitive || compose.spoiler)) {
      map.set('sensitive', true);
    }
  });
};

const removeMedia = (compose: Compose, mediaId: string) => {
  const prevSize = compose.media_attachments.size;

  return compose.withMutations(map => {
    map.update('media_attachments', list => list.filterNot(item => item.id === mediaId));
    map.set('idempotencyKey', uuid());

    if (prevSize === 1) {
      map.set('sensitive', false);
    }
  });
};

const insertSuggestion = (compose: Compose, position: number, token: string | null, completion: string, path: Array<string | number>) => {
  return compose.withMutations(map => {
    map.updateIn(path, oldText => `${(oldText as string).slice(0, position)}${completion} ${(oldText as string).slice(position + (token?.length ?? 0))}`);
    map.set('suggestion_token', null);
    map.set('suggestions', ImmutableList());
    if (path.length === 1 && path[0] === 'text') {
      map.set('focusDate', new Date());
      map.set('caretPosition', position + completion.length + 1);
    }
    map.set('idempotencyKey', uuid());
  });
};

const updateSuggestionTags = (compose: Compose, token: string, currentTrends: ImmutableList<Tag>) => {
  const prefix = token.slice(1);

  return compose.merge({
    suggestions: ImmutableList(currentTrends
      .filter((tag) => tag.get('name').toLowerCase().startsWith(prefix.toLowerCase()))
      .slice(0, 4)
      .map((tag) => '#' + tag.name)),
    suggestion_token: token,
  });
};

const insertEmoji = (compose: Compose, position: number, emojiData: Emoji, needsSpace: boolean) => {
  const oldText = compose.text;
  const emojiText = isNativeEmoji(emojiData) ? emojiData.native : emojiData.colons;
  const emoji = needsSpace ? ' ' + emojiText : emojiText;

  return compose.merge({
    text: `${oldText.slice(0, position)}${emoji} ${oldText.slice(position)}`,
    focusDate: new Date(),
    caretPosition: position + emoji.length + 1,
    idempotencyKey: uuid(),
  });
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
    .get('mentions')
    .filter((mention) => !(fragment.querySelector(`a[href="${mention.url}"]`) || mention.id === me))
    .map((m) => m.acct);

  return ImmutableOrderedSet<string>(mentions);
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
      return compose.set('privacy', value);
    case 'defaultContentType':
      return compose.set('content_type', value);
    default:
      return compose;
  }
};

const updateCompose = (state: State, key: string, updater: (compose: Compose) => Compose) =>
  state.update(key, state.get('default')!, updater);

export const initialState: State = ImmutableMap({
  default: ReducerCompose({ idempotencyKey: uuid(), resetFileKey: getResetFileKey() }),
});

export default function compose(state = initialState, action: ComposeAction | MeAction | SettingsAction | TimelineAction) {
  switch (action.type) {
    case COMPOSE_TYPE_CHANGE:
      return updateCompose(state, action.id, compose => compose.withMutations(map => {
        map.set('content_type', action.value);
        map.set('idempotencyKey', uuid());
      }));
    case COMPOSE_SPOILERNESS_CHANGE:
      return updateCompose(state, action.id, compose => compose.withMutations(map => {
        map.set('spoiler_text', '');
        map.set('spoiler', !compose.spoiler);
        map.set('sensitive', !compose.spoiler);
        map.set('idempotencyKey', uuid());
      }));
    case COMPOSE_SPOILER_TEXT_CHANGE:
      return updateCompose(state, action.id, compose => compose
        .set('spoiler_text', action.text)
        .set('idempotencyKey', uuid()));
    case COMPOSE_VISIBILITY_CHANGE:
      return updateCompose(state, action.id, compose => compose
        .set('privacy', action.value)
        .set('idempotencyKey', uuid()));
    case COMPOSE_CHANGE:
      return updateCompose(state, action.id, compose => compose
        .set('text', action.text)
        .set('idempotencyKey', uuid()));
    case COMPOSE_REPLY:
      return updateCompose(state, action.id, compose => compose.withMutations(map => {
        const defaultCompose = state.get('default')!;

        map.set('group_id', action.status.getIn(['group', 'id']) as string);
        map.set('in_reply_to', action.status.get('id'));
        map.set('to', action.explicitAddressing ? statusToMentionsArray(action.status, action.account) : ImmutableOrderedSet<string>());
        map.set('text', !action.explicitAddressing ? statusToTextMentions(action.status, action.account) : '');
        map.set('privacy', privacyPreference(action.status.visibility, defaultCompose.privacy));
        map.set('focusDate', new Date());
        map.set('caretPosition', null);
        map.set('idempotencyKey', uuid());
        map.set('content_type', defaultCompose.content_type);
      }));
    case COMPOSE_EVENT_REPLY:
      return updateCompose(state, action.id, compose => compose.withMutations(map => {
        map.set('in_reply_to', action.status.get('id'));
        map.set('to', statusToMentionsArray(action.status, action.account));
        map.set('idempotencyKey', uuid());
      }));
    case COMPOSE_QUOTE:
      return updateCompose(state, 'compose-modal', compose => compose.withMutations(map => {
        const author = action.status.getIn(['account', 'acct']) as string;
        const defaultCompose = state.get('default')!;

        map.set('quote', action.status.get('id'));
        map.set('to', ImmutableOrderedSet<string>([author]));
        map.set('text', '');
        map.set('privacy', privacyPreference(action.status.visibility, defaultCompose.privacy));
        map.set('focusDate', new Date());
        map.set('caretPosition', null);
        map.set('idempotencyKey', uuid());
        map.set('content_type', defaultCompose.content_type);
        map.set('spoiler', false);
        map.set('spoiler_text', '');

        if (action.status.visibility === 'group') {
          if (action.status.group?.group_visibility === 'everyone') {
            map.set('privacy', privacyPreference('public', defaultCompose.privacy));
          } else if (action.status.group?.group_visibility === 'members_only') {
            map.set('group_id', action.status.getIn(['group', 'id']) as string);
            map.set('privacy', 'group');
          }
        }
      }));
    case COMPOSE_SUBMIT_REQUEST:
      return updateCompose(state, action.id, compose => compose.set('is_submitting', true));
    case COMPOSE_UPLOAD_CHANGE_REQUEST:
      return updateCompose(state, action.id, compose => compose.set('is_changing_upload', true));
    case COMPOSE_REPLY_CANCEL:
    case COMPOSE_QUOTE_CANCEL:
    case COMPOSE_RESET:
    case COMPOSE_SUBMIT_SUCCESS:
      return updateCompose(state, action.id, () => state.get('default')!.withMutations(map => {
        map.set('idempotencyKey', uuid());
        map.set('in_reply_to', action.id.startsWith('reply:') ? action.id.slice(6) : null);
        if (action.id.startsWith('group:')) {
          map.set('privacy', 'group');
          map.set('group_id', action.id.slice(6));
        }
      }));
    case COMPOSE_SUBMIT_FAIL:
      return updateCompose(state, action.id, compose => compose.set('is_submitting', false));
    case COMPOSE_UPLOAD_CHANGE_FAIL:
      return updateCompose(state, action.composeId, compose => compose.set('is_changing_upload', false));
    case COMPOSE_UPLOAD_REQUEST:
      return updateCompose(state, action.id, compose => compose.set('is_uploading', true));
    case COMPOSE_UPLOAD_SUCCESS:
      return updateCompose(state, action.id, compose => appendMedia(compose, fromJS(action.media), state.get('default')!.sensitive));
    case COMPOSE_UPLOAD_FAIL:
      return updateCompose(state, action.id, compose => compose.set('is_uploading', false));
    case COMPOSE_UPLOAD_UNDO:
      return updateCompose(state, action.id, compose => removeMedia(compose, action.media_id));
    case COMPOSE_UPLOAD_PROGRESS:
      return updateCompose(state, action.id, compose => compose.set('progress', Math.round((action.loaded / action.total) * 100)));
    case COMPOSE_MENTION:
      return updateCompose(state, 'compose-modal', compose => compose.withMutations(map => {
        map.update('text', text => [text.trim(), `@${action.account.acct} `].filter((str) => str.length !== 0).join(' '));
        map.set('focusDate', new Date());
        map.set('caretPosition', null);
        map.set('idempotencyKey', uuid());
      }));
    case COMPOSE_DIRECT:
      return updateCompose(state, 'compose-modal', compose => compose.withMutations(map => {
        map.update('text', text => [text.trim(), `@${action.account.acct} `].filter((str) => str.length !== 0).join(' '));
        map.set('privacy', 'direct');
        map.set('focusDate', new Date());
        map.set('caretPosition', null);
        map.set('idempotencyKey', uuid());
      }));
    case COMPOSE_GROUP_POST:
      return updateCompose(state, action.id, compose => compose.withMutations(map => {
        map.set('privacy', 'group');
        map.set('group_id', action.group_id);
        map.set('focusDate', new Date());
        map.set('caretPosition', null);
        map.set('idempotencyKey', uuid());
      }));
    case COMPOSE_SUGGESTIONS_CLEAR:
      return updateCompose(state, action.id, compose => compose.update('suggestions', list => list?.clear()).set('suggestion_token', null));
    case COMPOSE_SUGGESTIONS_READY:
      return updateCompose(state, action.id, compose => compose.set('suggestions', ImmutableList(action.accounts ? action.accounts.map((item: APIEntity) => item.id) : action.emojis)).set('suggestion_token', action.token));
    case COMPOSE_SUGGESTION_SELECT:
      return updateCompose(state, action.id, compose => insertSuggestion(compose, action.position, action.token, action.completion, action.path));
    case COMPOSE_SUGGESTION_TAGS_UPDATE:
      return updateCompose(state, action.id, compose => updateSuggestionTags(compose, action.token, action.currentTrends));
    case COMPOSE_TAG_HISTORY_UPDATE:
      return updateCompose(state, action.id, compose => compose.set('tagHistory', ImmutableList(fromJS(action.tags)) as ImmutableList<string>));
    case TIMELINE_DELETE:
      return updateCompose(state, 'compose-modal', compose => {
        if (action.id === compose.in_reply_to) {
          return compose.set('in_reply_to', null);
        } if (action.id === compose.quote) {
          return compose.set('quote', null);
        } else {
          return compose;
        }
      });
    case COMPOSE_EMOJI_INSERT:
      return updateCompose(state, action.id, compose => insertEmoji(compose, action.position, action.emoji, action.needsSpace));
    case COMPOSE_UPLOAD_CHANGE_SUCCESS:
      return updateCompose(state, action.id, compose => compose
        .set('is_changing_upload', false)
        .update('media_attachments', list => list.map(item => {
          if (item.id === action.media.id) {
            return normalizeAttachment(action.media);
          }

          return item;
        })));
    case COMPOSE_SET_STATUS:
      return updateCompose(state, 'compose-modal', compose => compose.withMutations(map => {
        if (!action.withRedraft) {
          map.set('id', action.status.id);
        }
        map.set('text', action.rawText || unescapeHTML(expandMentions(action.status)));
        map.set('to', action.explicitAddressing ? getExplicitMentions(action.status.account.id, action.status) : ImmutableOrderedSet<string>());
        map.set('in_reply_to', action.status.get('in_reply_to_id'));
        map.set('privacy', action.status.get('visibility'));
        map.set('focusDate', new Date());
        map.set('caretPosition', null);
        map.set('idempotencyKey', uuid());
        map.set('content_type', action.contentType || 'text/plain');
        map.set('quote', action.status.getIn(['quote', 'id']) as string);
        map.set('group_id', action.status.getIn(['group', 'id']) as string);

        if (action.v?.software === PLEROMA && action.withRedraft && hasIntegerMediaIds(action.status.toJS() as any)) {
          map.set('media_attachments', ImmutableList());
        } else {
          map.set('media_attachments', action.status.media_attachments);
        }

        if (action.status.get('spoiler_text').length > 0) {
          map.set('spoiler', true);
          map.set('spoiler_text', action.status.get('spoiler_text'));
        } else {
          map.set('spoiler', false);
          map.set('spoiler_text', '');
        }

        if (action.status.poll && typeof action.status.poll === 'object') {
          map.set('poll', PollRecord({
            options: ImmutableList(action.status.poll.options.map(({ title }) => title)),
            multiple: action.status.poll.multiple,
            expires_in: 24 * 3600,
          }));
        }
      }));
    case COMPOSE_POLL_ADD:
      return updateCompose(state, action.id, compose => compose.set('poll', PollRecord()));
    case COMPOSE_POLL_REMOVE:
      return updateCompose(state, action.id, compose => compose.set('poll', null));
    case COMPOSE_SCHEDULE_ADD:
      return updateCompose(state, action.id, compose => compose.set('schedule', new Date(Date.now() + 10 * 60 * 1000)));
    case COMPOSE_SCHEDULE_SET:
      return updateCompose(state, action.id, compose => compose.set('schedule', action.date));
    case COMPOSE_SCHEDULE_REMOVE:
      return updateCompose(state, action.id, compose => compose.set('schedule', null));
    case COMPOSE_POLL_OPTION_ADD:
      return updateCompose(state, action.id, compose => compose.updateIn(['poll', 'options'], options => (options as ImmutableList<string>).push(action.title)));
    case COMPOSE_POLL_OPTION_CHANGE:
      return updateCompose(state, action.id, compose => compose.setIn(['poll', 'options', action.index], action.title));
    case COMPOSE_POLL_OPTION_REMOVE:
      return updateCompose(state, action.id, compose => compose.updateIn(['poll', 'options'], options => (options as ImmutableList<string>).delete(action.index)));
    case COMPOSE_POLL_SETTINGS_CHANGE:
      return updateCompose(state, action.id, compose => compose.update('poll', poll => {
        if (!poll) return null;
        return poll.withMutations((poll) => {
          if (action.expiresIn) {
            poll.set('expires_in', action.expiresIn);
          }
          if (typeof action.isMultiple === 'boolean') {
            poll.set('multiple', action.isMultiple);
          }
        });
      }));
    case COMPOSE_ADD_TO_MENTIONS:
      return updateCompose(state, action.id, compose => compose.update('to', mentions => mentions!.add(action.account)));
    case COMPOSE_REMOVE_FROM_MENTIONS:
      return updateCompose(state, action.id, compose => compose.update('to', mentions => mentions!.delete(action.account)));
    case COMPOSE_SET_GROUP_TIMELINE_VISIBLE:
      return updateCompose(state, action.id, compose => compose.set('group_timeline_visible', action.groupTimelineVisible));
    case ME_FETCH_SUCCESS:
    case ME_PATCH_SUCCESS:
      return updateCompose(state, 'default', compose => importAccount(compose, action.me));
    case SETTING_CHANGE:
      return updateCompose(state, 'default', compose => updateSetting(compose, action.path, action.value));
    default:
      return state;
  }
}
