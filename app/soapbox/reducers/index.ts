import { Record as ImmutableRecord } from 'immutable';
import { default as lodashGet } from 'lodash/get';
import { combineReducers } from 'redux-immutable';

import { AUTH_LOGGED_OUT } from 'soapbox/actions/auth';
import * as BuildConfig from 'soapbox/build-config';
import { Entities } from 'soapbox/entity-store/entities';
import entities from 'soapbox/entity-store/reducer';

import account_notes from './account-notes';
import accounts_counters from './accounts-counters';
import accounts_meta from './accounts-meta';
import admin from './admin';
import admin_announcements from './admin-announcements';
import admin_log from './admin-log';
import admin_user_index from './admin-user-index';
import aliases from './aliases';
import announcements from './announcements';
import auth from './auth';
import backups from './backups';
import chat_message_lists from './chat-message-lists';
import chat_messages from './chat-messages';
import chats from './chats';
import compose from './compose';
import compose_event from './compose-event';
import contexts from './contexts';
import conversations from './conversations';
import custom_emojis from './custom-emojis';
import domain_lists from './domain-lists';
import dropdown_menu from './dropdown-menu';
import filters from './filters';
import followed_tags from './followed_tags';
import group_memberships from './group-memberships';
import group_relationships from './group-relationships';
import groups from './groups';
import history from './history';
import instance from './instance';
import listAdder from './list-adder';
import listEditor from './list-editor';
import lists from './lists';
import locations from './locations';
import me from './me';
import meta from './meta';
import modals from './modals';
import mutes from './mutes';
import notifications from './notifications';
import onboarding from './onboarding';
import patron from './patron';
import pending_statuses from './pending-statuses';
import polls from './polls';
import profile_hover_card from './profile-hover-card';
import push_notifications from './push-notifications';
import relationships from './relationships';
import reports from './reports';
import rules from './rules';
import scheduled_statuses from './scheduled-statuses';
import search from './search';
import security from './security';
import settings from './settings';
import sidebar from './sidebar';
import soapbox from './soapbox';
import status_hover_card from './status-hover-card';
import status_lists from './status-lists';
import statuses from './statuses';
import suggestions from './suggestions';
import tags from './tags';
import timelines from './timelines';
import trending_statuses from './trending-statuses';
import trends from './trends';
import user_lists from './user-lists';
import verification from './verification';

import type { EntityStore } from 'soapbox/entity-store/types';
import type { Account } from 'soapbox/schemas';

interface LegacyImmutable<T> {
  get(key: string): (T & LegacyImmutable<T>) | undefined
  getIn(keyPath: string[]): unknown
  find(predicate: (value: T & LegacyImmutable<T>, key: string) => boolean): T & LegacyImmutable<T> | undefined
  toJS(): any
}

function immutableize<T, S extends Record<string, T | undefined>>(state: S): S & LegacyImmutable<T> {
  return {
    ...state,

    get(id: string): T & LegacyImmutable<T> | undefined {
      const entity = state[id];
      return entity ? immutableize(entity) : undefined;
    },

    getIn(keyPath: string[]): unknown {
      return lodashGet(state, keyPath);
    },

    find(predicate: (value: T & LegacyImmutable<T>, key: string) => boolean): T & LegacyImmutable<T> | undefined {
      const result = Object.entries(state).find(([key, value]) => value && predicate(immutableize(value), key))?.[1];
      return result ? immutableize(result) : undefined;
    },

    toJS() {
      return state;
    },
  };
}

const reducers = {
  account_notes,
  accounts: (state: any, action: any) => {
    const result = entities(state, action)[Entities.ACCOUNTS]?.store as EntityStore<Account> || {};
    return immutableize<Account, typeof result>(result);
  },
  accounts_counters,
  accounts_meta,
  admin,
  admin_announcements,
  admin_log,
  admin_user_index,
  aliases,
  announcements,
  auth,
  backups,
  chat_message_lists,
  chat_messages,
  chats,
  compose,
  compose_event,
  contexts,
  conversations,
  custom_emojis,
  domain_lists,
  dropdown_menu,
  entities,
  filters,
  followed_tags,
  group_memberships,
  group_relationships,
  groups,
  history,
  instance,
  listAdder,
  listEditor,
  lists,
  locations,
  me,
  meta,
  modals,
  mutes,
  notifications,
  onboarding,
  patron,
  pending_statuses,
  polls,
  profile_hover_card,
  push_notifications,
  relationships,
  reports,
  rules,
  scheduled_statuses,
  search,
  security,
  settings,
  sidebar,
  soapbox,
  status_hover_card,
  status_lists,
  statuses,
  suggestions,
  tags,
  timelines,
  trending_statuses,
  trends,
  user_lists,
  verification,
};

// Build a default state from all reducers: it has the key and `undefined`
export const StateRecord = ImmutableRecord(
  Object.keys(reducers).reduce((params: Record<string, any>, reducer) => {
    params[reducer] = undefined;
    return params;
  }, {}),
);

const appReducer = combineReducers(reducers, StateRecord);

// Clear the state (mostly) when the user logs out
const logOut = (state: any = StateRecord()): ReturnType<typeof appReducer> => {
  if (BuildConfig.NODE_ENV === 'production') {
    location.href = '/login';
  }

  const whitelist: string[] = ['instance', 'soapbox', 'custom_emojis', 'auth'];

  return StateRecord(
    whitelist.reduce((acc: Record<string, any>, curr) => {
      acc[curr] = state.get(curr);
      return acc;
    }, {}),
  ) as unknown as ReturnType<typeof appReducer>;
};

const rootReducer: typeof appReducer = (state, action) => {
  switch (action.type) {
    case AUTH_LOGGED_OUT:
      return appReducer(logOut(state), action);
    default:
      return appReducer(state, action);
  }
};

export default rootReducer;
