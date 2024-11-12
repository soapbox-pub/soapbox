import { Map as ImmutableMap, fromJS } from 'immutable';
import { AnyAction } from 'redux';

import { ME_FETCH_SUCCESS } from 'soapbox/actions/me.ts';

import { EMOJI_CHOOSE } from '../actions/emojis.ts';
import { NOTIFICATIONS_FILTER_SET } from '../actions/notifications.ts';
import { SEARCH_FILTER_SET } from '../actions/search.ts';
import {
  SETTING_CHANGE,
  SETTING_SAVE,
  SETTINGS_UPDATE,
  FE_NAME,
} from '../actions/settings.ts';

import type { Emoji } from 'soapbox/features/emoji/index.ts';
import type { APIEntity } from 'soapbox/types/entities.ts';

type State = ImmutableMap<string, any>;

const updateFrequentEmojis = (state: State, emoji: Emoji) => state.update('frequentlyUsedEmojis', ImmutableMap(), map => map.update(emoji.id, 0, (count: number) => count + 1)).set('saved', false);

const importSettings = (state: State, account: APIEntity) => {
  account = fromJS(account);
  const prefs = account.getIn(['pleroma', 'settings_store', FE_NAME], ImmutableMap());
  return state.merge(prefs) as State;
};

// Default settings are in action/settings.js
//
// Settings should be accessed with `getSettings(getState()).getIn(...)`
// instead of directly from the state.
export default function settings(state: State = ImmutableMap<string, any>({ saved: true }), action: AnyAction): State {
  switch (action.type) {
    case ME_FETCH_SUCCESS:
      return importSettings(state, action.me);
    case NOTIFICATIONS_FILTER_SET:
    case SEARCH_FILTER_SET:
    case SETTING_CHANGE:
      return state
        .setIn(action.path, action.value)
        .set('saved', false);
    case EMOJI_CHOOSE:
      return updateFrequentEmojis(state, action.emoji);
    case SETTING_SAVE:
      return state.set('saved', true);
    case SETTINGS_UPDATE:
      return ImmutableMap<string, any>(fromJS(action.settings));
    default:
      return state;
  }
}
