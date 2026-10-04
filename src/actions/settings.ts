import { defineMessage } from 'react-intl';
import { createSelector } from 'reselect';

import { patchMe } from '@/actions/me.ts';
import messages from '@/messages.ts';
import toast from '@/toast.tsx';
import { isLoggedIn } from '@/utils/auth.ts';
import { mergeDeep } from '@/utils/merge-deep.ts';

import type { AppDispatch, RootState } from '@/store.ts';

const SETTING_CHANGE = 'SETTING_CHANGE' as const;
const SETTING_SAVE   = 'SETTING_SAVE' as const;
const SETTINGS_UPDATE = 'SETTINGS_UPDATE' as const;

const FE_NAME = 'soapbox_fe';

/** Options when changing/saving settings. */
type SettingOpts = {
  /** Whether to display an alert when settings are saved. */
  showAlert?: boolean;
}

const saveSuccessMessage = defineMessage({ id: 'settings.save.success', defaultMessage: 'Your preferences have been saved!' });

const defaultSettings = {
  onboarded: false,
  skinTone: 1,
  reduceMotion: false,
  underlineLinks: false,
  autoPlayGif: true,
  displayMedia: 'default',
  expandSpoilers: false,
  unfollowModal: false,
  boostModal: false,
  deleteModal: true,
  missingDescriptionModal: false,
  defaultPrivacy: 'public',
  defaultContentType: 'text/plain',
  themeMode: 'system',
  themePreset: null as string | null,
  locale: navigator.language || 'en',
  showExplanationBox: true,
  explanationBox: true,
  autoloadTimelines: true,
  autoloadMore: true,
  preserveSpoilers: false,

  systemFont: false,
  demetricator: false,

  isDeveloper: false,

  chats: {
    panes: [] as { chat_id: string; state: string }[],
    mainWindow: 'minimized',
    sound: true,
  },

  home: {
    shows: {
      reblog: true,
      reply: true,
      direct: false,
    },

    regex: {
      body: '',
    },
  },

  notifications: {
    alerts: {
      follow: true,
      follow_request: false,
      favourite: true,
      reblog: true,
      mention: true,
      poll: true,
      move: true,
      'pleroma:emoji_reaction': true,
    },

    quickFilter: {
      active: 'all',
      show: true,
      advanced: false,
    },

    shows: {
      follow: true,
      follow_request: true,
      favourite: true,
      reblog: true,
      mention: true,
      poll: true,
      move: true,
      'pleroma:emoji_reaction': true,
    },

    sounds: {
      follow: false,
      follow_request: false,
      favourite: false,
      reblog: false,
      mention: false,
      poll: false,
      move: false,
      'pleroma:emoji_reaction': false,
    },

    birthdays: {
      show: true,
    },
  },

  community: {
    shows: {
      reblog: false,
      reply: true,
      direct: false,
    },
    other: {
      onlyMedia: false,
    },
    regex: {
      body: '',
    },
  },

  public: {
    shows: {
      reblog: true,
      reply: true,
      direct: false,
    },
    other: {
      onlyMedia: false,
    },
    regex: {
      body: '',
    },
  },

  direct: {
    regex: {
      body: '',
    },
  },

  account_timeline: {
    shows: {
      reblog: true,
      pinned: true,
      direct: false,
    },
  },

  groups: {} as Record<string, unknown>,

  trends: {
    show: true,
  },

  columns: [
    { id: 'COMPOSE', uuid: crypto.randomUUID(), params: {} },
    { id: 'HOME', uuid: crypto.randomUUID(), params: {} },
    { id: 'NOTIFICATIONS', uuid: crypto.randomUUID(), params: {} },
  ],

  remote_timeline: {
    pinnedHosts: [] as string[],
  },
};

type Settings = typeof defaultSettings & { [key: string]: unknown };

const getSettings = createSelector([
  (state: RootState) => state.soapbox.defaultSettings,
  (state: RootState) => state.settings,
], (soapboxSettings, settings): Settings => {
  return mergeDeep(defaultSettings, soapboxSettings, settings);
});

interface SettingChangeAction {
  type: typeof SETTING_CHANGE;
  path: string[];
  value: any;
}

const changeSettingImmediate = (path: string[], value: any, opts?: SettingOpts) =>
  (dispatch: AppDispatch) => {
    const action: SettingChangeAction = {
      type: SETTING_CHANGE,
      path,
      value,
    };

    dispatch(action);
    dispatch(saveSettingsImmediate(opts));
  };

const changeSetting = (path: string[], value: any, opts?: SettingOpts) =>
  (dispatch: AppDispatch) => {
    const action: SettingChangeAction = {
      type: SETTING_CHANGE,
      path,
      value,
    };

    dispatch(action);
    return dispatch(saveSettings(opts));
  };

const saveSettingsImmediate = (opts?: SettingOpts) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    const state = getState();
    if (getSettings(state).saved) return;

    const { saved: _, ...data } = state.settings;

    dispatch(patchMe({
      pleroma_settings_store: {
        [FE_NAME]: data,
      },
    })).then(() => {
      dispatch({ type: SETTING_SAVE });

      if (opts?.showAlert) {
        toast.success(saveSuccessMessage);
      }
    }).catch(error => {
      toast.showAlertForError(error);
    });
  };

const saveSettings = (opts?: SettingOpts) =>
  (dispatch: AppDispatch) => dispatch(saveSettingsImmediate(opts));

const getLocale = (state: RootState, fallback = 'en') => {
  const localeWithVariant = getSettings(state).locale.replace('_', '-');
  const locale = localeWithVariant.split('-')[0];
  const fallbackLocale = Object.keys(messages).includes(locale) ? locale : fallback;
  return Object.keys(messages).includes(localeWithVariant) ? localeWithVariant : fallbackLocale;
};

type SettingsAction =
  | SettingChangeAction
  | { type: typeof SETTING_SAVE }

export {
  SETTING_CHANGE,
  SETTING_SAVE,
  SETTINGS_UPDATE,
  FE_NAME,
  defaultSettings,
  getSettings,
  changeSettingImmediate,
  changeSetting,
  saveSettingsImmediate,
  saveSettings,
  getLocale,
  type SettingsAction,
  type Settings,
};
