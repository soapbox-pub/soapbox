import { Record as ImmutableRecord } from 'immutable';
import { combineReducers } from 'redux-immutable';

import { AUTH_LOGGED_OUT } from 'soapbox/actions/auth';
import * as BuildConfig from 'soapbox/build-config';

import account_notes from './account-notes';
import accounts from './accounts';
import accounts_counters from './accounts-counters';
import accounts_meta from './accounts-meta';
import admin from './admin';
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

const reducers = {
  dropdown_menu,
  timelines,
  meta,
  modals,
  user_lists,
  domain_lists,
  status_lists,
  account_notes,
  accounts,
  accounts_counters,
  statuses,
  relationships,
  settings,
  push_notifications,
  mutes,
  reports,
  contexts,
  compose,
  search,
  notifications,
  custom_emojis,
  lists,
  listEditor,
  listAdder,
  locations,
  filters,
  conversations,
  suggestions,
  polls,
  trends,
  sidebar,
  patron,
  soapbox,
  instance,
  me,
  auth,
  admin,
  chats,
  chat_messages,
  chat_message_lists,
  profile_hover_card,
  status_hover_card,
  backups,
  admin_log,
  security,
  scheduled_statuses,
  pending_statuses,
  aliases,
  accounts_meta,
  trending_statuses,
  verification,
  onboarding,
  rules,
  history,
  announcements,
  compose_event,
  admin_user_index,
  tags,
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
