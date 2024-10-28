import { combineReducers } from '@reduxjs/toolkit';

import entities from 'soapbox/entity-store/reducer';

import accounts_meta from './accounts-meta';
import admin from './admin';
import aliases from './aliases';
import auth from './auth';
import backups from './backups';
import bunker from './bunker';
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
import followed_tags from './followed-tags';
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
import relationships from './relationships';
import reports from './reports';
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

export default combineReducers({
  accounts_meta,
  admin,
  aliases,
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
  relationships,
  reports,
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
  bunker: bunker.reducer,
});