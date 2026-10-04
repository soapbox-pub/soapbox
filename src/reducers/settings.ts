import { set } from 'es-toolkit/compat';
import { produce } from 'immer';
import { AnyAction } from 'redux';

import { ME_FETCH_SUCCESS } from '@/actions/me.ts';
import { loadStoredTheme } from '@/utils/theme-presets.ts';

import { EMOJI_CHOOSE } from '../actions/emojis.ts';
import { NOTIFICATIONS_FILTER_SET } from '../actions/notifications.ts';
import { SEARCH_FILTER_SET } from '../actions/search.ts';
import {
  SETTING_CHANGE,
  SETTING_SAVE,
  SETTINGS_UPDATE,
  FE_NAME,
} from '../actions/settings.ts';

import type { Emoji } from '@/features/emoji/index.ts';
import type { APIEntity } from '@/types/entities.ts';

type State = Record<string, unknown>;

const updateFrequentEmojis = (state: State, emoji: Emoji): State => {
  const frequentlyUsedEmojis = (state.frequentlyUsedEmojis ?? {}) as Record<string, number>;

  return {
    ...state,
    frequentlyUsedEmojis: {
      ...frequentlyUsedEmojis,
      [emoji.id]: (frequentlyUsedEmojis[emoji.id] ?? 0) + 1,
    },
    saved: false,
  };
};

const importSettings = (state: State, account: APIEntity): State => {
  const prefs = account?.pleroma?.settings_store?.[FE_NAME] ?? {};
  return { ...state, ...prefs };
};

// Default settings are in action/settings.js
//
// Settings should be accessed with `getSettings(getState())`
// instead of directly from the state.
//
// The theme is seeded from localStorage so it applies before login (or
// without a backend at all). Settings from the account override it.
export default function settings(state: State = { saved: true, ...loadStoredTheme() }, action: AnyAction): State {
  switch (action.type) {
    case ME_FETCH_SUCCESS:
      return importSettings(state, action.me);
    case NOTIFICATIONS_FILTER_SET:
    case SEARCH_FILTER_SET:
    case SETTING_CHANGE:
      return produce(state, draft => {
        set(draft, action.path, action.value);
        draft.saved = false;
      });
    case EMOJI_CHOOSE:
      return updateFrequentEmojis(state, action.emoji);
    case SETTING_SAVE:
      return { ...state, saved: true };
    case SETTINGS_UPDATE:
      return { ...action.settings };
    default:
      return state;
  }
}
