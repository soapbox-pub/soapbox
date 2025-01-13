import {
  Map as ImmutableMap,
  OrderedSet as ImmutableOrderedSet,
  Record as ImmutableRecord,
} from 'immutable';

import {
  STATUS_QUOTES_EXPAND_FAIL,
  STATUS_QUOTES_EXPAND_REQUEST,
  STATUS_QUOTES_EXPAND_SUCCESS,
  STATUS_QUOTES_FETCH_FAIL,
  STATUS_QUOTES_FETCH_REQUEST,
  STATUS_QUOTES_FETCH_SUCCESS,
} from 'soapbox/actions/status-quotes.ts';
import { STATUS_CREATE_SUCCESS } from 'soapbox/actions/statuses.ts';

import {
  RECENT_EVENTS_FETCH_REQUEST,
  RECENT_EVENTS_FETCH_SUCCESS,
  RECENT_EVENTS_FETCH_FAIL,
  JOINED_EVENTS_FETCH_REQUEST,
  JOINED_EVENTS_FETCH_SUCCESS,
  JOINED_EVENTS_FETCH_FAIL,
} from '../actions/events.ts';
import {
  FAVOURITED_STATUSES_FETCH_REQUEST,
  FAVOURITED_STATUSES_FETCH_SUCCESS,
  FAVOURITED_STATUSES_FETCH_FAIL,
  FAVOURITED_STATUSES_EXPAND_REQUEST,
  FAVOURITED_STATUSES_EXPAND_SUCCESS,
  FAVOURITED_STATUSES_EXPAND_FAIL,
  ACCOUNT_FAVOURITED_STATUSES_FETCH_REQUEST,
  ACCOUNT_FAVOURITED_STATUSES_FETCH_SUCCESS,
  ACCOUNT_FAVOURITED_STATUSES_FETCH_FAIL,
  ACCOUNT_FAVOURITED_STATUSES_EXPAND_REQUEST,
  ACCOUNT_FAVOURITED_STATUSES_EXPAND_SUCCESS,
  ACCOUNT_FAVOURITED_STATUSES_EXPAND_FAIL,
} from '../actions/favourites.ts';
import {
  FAVOURITE_SUCCESS,
  UNFAVOURITE_SUCCESS,
  PIN_SUCCESS,
  UNPIN_SUCCESS,
} from '../actions/interactions.ts';
import {
  PINNED_STATUSES_FETCH_SUCCESS,
} from '../actions/pin-statuses.ts';
import {
  SCHEDULED_STATUSES_FETCH_REQUEST,
  SCHEDULED_STATUSES_FETCH_SUCCESS,
  SCHEDULED_STATUSES_FETCH_FAIL,
  SCHEDULED_STATUSES_EXPAND_REQUEST,
  SCHEDULED_STATUSES_EXPAND_SUCCESS,
  SCHEDULED_STATUSES_EXPAND_FAIL,
  SCHEDULED_STATUS_CANCEL_REQUEST,
  SCHEDULED_STATUS_CANCEL_SUCCESS,
} from '../actions/scheduled-statuses.ts';

import type { AnyAction } from 'redux';
import type { APIEntity } from 'soapbox/types/entities.ts';

export const StatusListRecord = ImmutableRecord({
  next: null as string | null,
  loaded: false,
  isLoading: null as boolean | null,
  items: ImmutableOrderedSet<string>(),
});

type State = ImmutableMap<string, StatusList>;
type StatusList = ReturnType<typeof StatusListRecord>;

const initialState: State = ImmutableMap({
  favourites: StatusListRecord(),
  bookmarks: StatusListRecord(),
  pins: StatusListRecord(),
  scheduled_statuses: StatusListRecord(),
  recent_events: StatusListRecord(),
  joined_events: StatusListRecord(),
});

const getStatusId = (status: string | APIEntity) => typeof status === 'string' ? status : status.id;

const getStatusIds = (statuses: APIEntity[] = []) => (
  ImmutableOrderedSet(statuses.map(getStatusId))
);

const setLoading = (state: State, listType: string, loading: boolean) => {
  return state.update(listType, StatusListRecord(), listMap => listMap.set('isLoading', loading));
};

const normalizeList = (state: State, listType: string, statuses: APIEntity[], next: string | null) => {
  return state.update(listType, StatusListRecord(), listMap => listMap.withMutations(map => {
    map.set('next', next);
    map.set('loaded', true);
    map.set('isLoading', false);
    map.set('items', getStatusIds(statuses));
  }));
};

const appendToList = (state: State, listType: string, statuses: APIEntity[], next: string | null) => {
  const newIds = getStatusIds(statuses);

  return state.update(listType, StatusListRecord(), listMap => listMap.withMutations(map => {
    map.set('next', next);
    map.set('isLoading', false);
    map.update('items', items => items.union(newIds));
  }));
};

const prependOneToList = (state: State, listType: string, status: APIEntity) => {
  const statusId = getStatusId(status);
  return state.update(listType, StatusListRecord(), listMap => listMap.update('items', items => {
    return ImmutableOrderedSet([statusId]).union(items);
  }));
};

const removeOneFromList = (state: State, listType: string, status: APIEntity) => {
  const statusId = getStatusId(status);
  return state.update(listType, StatusListRecord(), listMap => listMap.update('items', items => items.delete(statusId)));
};

const maybeAppendScheduledStatus = (state: State, status: APIEntity) => {
  if (!status.scheduled_at) return state;
  return prependOneToList(state, 'scheduled_statuses', getStatusId(status));
};

export default function statusLists(state = initialState, action: AnyAction) {
  switch (action.type) {
    case FAVOURITED_STATUSES_FETCH_REQUEST:
    case FAVOURITED_STATUSES_EXPAND_REQUEST:
      return setLoading(state, 'favourites', true);
    case FAVOURITED_STATUSES_FETCH_FAIL:
    case FAVOURITED_STATUSES_EXPAND_FAIL:
      return setLoading(state, 'favourites', false);
    case FAVOURITED_STATUSES_FETCH_SUCCESS:
      return normalizeList(state, 'favourites', action.statuses, action.next);
    case FAVOURITED_STATUSES_EXPAND_SUCCESS:
      return appendToList(state, 'favourites', action.statuses, action.next);
    case ACCOUNT_FAVOURITED_STATUSES_FETCH_REQUEST:
    case ACCOUNT_FAVOURITED_STATUSES_EXPAND_REQUEST:
      return setLoading(state, `favourites:${action.accountId}`, true);
    case ACCOUNT_FAVOURITED_STATUSES_FETCH_FAIL:
    case ACCOUNT_FAVOURITED_STATUSES_EXPAND_FAIL:
      return setLoading(state, `favourites:${action.accountId}`, false);
    case ACCOUNT_FAVOURITED_STATUSES_FETCH_SUCCESS:
      return normalizeList(state, `favourites:${action.accountId}`, action.statuses, action.next);
    case ACCOUNT_FAVOURITED_STATUSES_EXPAND_SUCCESS:
      return appendToList(state, `favourites:${action.accountId}`, action.statuses, action.next);
    case FAVOURITE_SUCCESS:
      return prependOneToList(state, 'favourites', action.status);
    case UNFAVOURITE_SUCCESS:
      return removeOneFromList(state, 'favourites', action.status);
    case PINNED_STATUSES_FETCH_SUCCESS:
      return normalizeList(state, 'pins', action.statuses, action.next);
    case PIN_SUCCESS:
      return prependOneToList(state, 'pins', action.status);
    case UNPIN_SUCCESS:
      return removeOneFromList(state, 'pins', action.status);
    case SCHEDULED_STATUSES_FETCH_REQUEST:
    case SCHEDULED_STATUSES_EXPAND_REQUEST:
      return setLoading(state, 'scheduled_statuses', true);
    case SCHEDULED_STATUSES_FETCH_FAIL:
    case SCHEDULED_STATUSES_EXPAND_FAIL:
      return setLoading(state, 'scheduled_statuses', false);
    case SCHEDULED_STATUSES_FETCH_SUCCESS:
      return normalizeList(state, 'scheduled_statuses', action.statuses, action.next);
    case SCHEDULED_STATUSES_EXPAND_SUCCESS:
      return appendToList(state, 'scheduled_statuses', action.statuses, action.next);
    case SCHEDULED_STATUS_CANCEL_REQUEST:
    case SCHEDULED_STATUS_CANCEL_SUCCESS:
      return removeOneFromList(state, 'scheduled_statuses', action.id || action.status.id);
    case STATUS_QUOTES_FETCH_REQUEST:
    case STATUS_QUOTES_EXPAND_REQUEST:
      return setLoading(state, `quotes:${action.statusId}`, true);
    case STATUS_QUOTES_FETCH_FAIL:
    case STATUS_QUOTES_EXPAND_FAIL:
      return setLoading(state, `quotes:${action.statusId}`, false);
    case STATUS_QUOTES_FETCH_SUCCESS:
      return normalizeList(state, `quotes:${action.statusId}`, action.statuses, action.next);
    case STATUS_QUOTES_EXPAND_SUCCESS:
      return appendToList(state, `quotes:${action.statusId}`, action.statuses, action.next);
    case RECENT_EVENTS_FETCH_REQUEST:
      return setLoading(state, 'recent_events', true);
    case RECENT_EVENTS_FETCH_FAIL:
      return setLoading(state, 'recent_events', false);
    case RECENT_EVENTS_FETCH_SUCCESS:
      return normalizeList(state, 'recent_events', action.statuses, action.next);
    case JOINED_EVENTS_FETCH_REQUEST:
      return setLoading(state, 'joined_events', true);
    case JOINED_EVENTS_FETCH_FAIL:
      return setLoading(state, 'joined_events', false);
    case JOINED_EVENTS_FETCH_SUCCESS:
      return normalizeList(state, 'joined_events', action.statuses, action.next);
    case STATUS_CREATE_SUCCESS:
      return maybeAppendScheduledStatus(state, action.status);
    default:
      return state;
  }
}
