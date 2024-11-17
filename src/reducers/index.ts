import { combineReducers } from '@reduxjs/toolkit';

import entities from 'soapbox/entity-store/reducer.ts';

import accounts_meta from './accounts-meta.ts';
import admin from './admin.ts';
import aliases from './aliases.ts';
import auth from './auth.ts';
import backups from './backups.ts';
import chat_message_lists from './chat-message-lists.ts';
import chat_messages from './chat-messages.ts';
import chats from './chats.ts';
import compose_event from './compose-event.ts';
import compose from './compose.ts';
import contexts from './contexts.ts';
import conversations from './conversations.ts';
import domain_lists from './domain-lists.ts';
import dropdown_menu from './dropdown-menu.ts';
import filters from './filters.ts';
import followed_tags from './followed-tags.ts';
import group_memberships from './group-memberships.ts';
import group_relationships from './group-relationships.ts';
import groups from './groups.ts';
import history from './history.ts';
import instance from './instance.ts';
import listAdder from './list-adder.ts';
import listEditor from './list-editor.ts';
import lists from './lists.ts';
import locations from './locations.ts';
import me from './me.ts';
import meta from './meta.ts';
import modals from './modals.ts';
import mutes from './mutes.ts';
import notifications from './notifications.ts';
import onboarding from './onboarding.ts';
import patron from './patron.ts';
import pending_statuses from './pending-statuses.ts';
import polls from './polls.ts';
import profile_hover_card from './profile-hover-card.ts';
import relationships from './relationships.ts';
import reports from './reports.ts';
import scheduled_statuses from './scheduled-statuses.ts';
import search from './search.ts';
import security from './security.ts';
import settings from './settings.ts';
import sidebar from './sidebar.ts';
import soapbox from './soapbox.ts';
import status_hover_card from './status-hover-card.ts';
import status_lists from './status-lists.ts';
import statuses from './statuses.ts';
import suggestions from './suggestions.ts';
import tags from './tags.ts';
import timelines from './timelines.ts';
import trending_statuses from './trending-statuses.ts';
import trends from './trends.ts';
import user_lists from './user-lists.ts';

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
});