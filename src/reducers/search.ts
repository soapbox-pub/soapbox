import { OrderedSet as ImmutableOrderedSet, Record as ImmutableRecord, fromJS } from 'immutable';

import { normalizeTag } from 'soapbox/normalizers';

import {
  COMPOSE_MENTION,
  COMPOSE_REPLY,
  COMPOSE_DIRECT,
  COMPOSE_QUOTE,
} from '../actions/compose';
import {
  SEARCH_CHANGE,
  SEARCH_CLEAR,
  SEARCH_FETCH_REQUEST,
  SEARCH_FETCH_SUCCESS,
  SEARCH_SHOW,
  SEARCH_FILTER_SET,
  SEARCH_EXPAND_REQUEST,
  SEARCH_EXPAND_SUCCESS,
  SEARCH_ACCOUNT_SET,
  SEARCH_RESULTS_CLEAR,
} from '../actions/search';

import type { AnyAction } from 'redux';
import type { APIEntity, Tag } from 'soapbox/types/entities';

const ResultsRecord = ImmutableRecord({
  accounts: ImmutableOrderedSet<string>(),
  statuses: ImmutableOrderedSet<string>(),
  groups: ImmutableOrderedSet<string>(),
  hashtags: ImmutableOrderedSet<Tag>(), // it's a list of maps
  accountsHasMore: false,
  statusesHasMore: false,
  groupsHasMore: false,
  hashtagsHasMore: false,
  accountsLoaded: false,
  statusesLoaded: false,
  groupsLoaded: false,
  hashtagsLoaded: false,
});

const ReducerRecord = ImmutableRecord({
  value: '',
  submitted: false,
  submittedValue: '',
  hidden: false,
  results: ResultsRecord(),
  filter: 'accounts' as SearchFilter,
  accountId: null as string | null,
  next: null as string | null,
});

type State = ReturnType<typeof ReducerRecord>;
type APIEntities = Array<APIEntity>;
export type SearchFilter = 'accounts' | 'statuses' | 'groups' | 'hashtags';

const toIds = (items: APIEntities = []) => {
  return ImmutableOrderedSet(items.map(item => item.id));
};

const importResults = (state: State, results: APIEntity, searchTerm: string, searchType: SearchFilter, next: string | null) => {
  return state.withMutations(state => {
    if (state.value === searchTerm && state.filter === searchType) {
      state.set('results', ResultsRecord({
        accounts: toIds(results.accounts),
        statuses: toIds(results.statuses),
        groups: toIds(results.groups),
        hashtags: ImmutableOrderedSet(results.hashtags.map(normalizeTag)), // it's a list of records
        accountsHasMore: results.accounts.length >= 20,
        statusesHasMore: results.statuses.length >= 20,
        groupsHasMore: results.groups?.length >= 20,
        hashtagsHasMore: results.hashtags.length >= 20,
        accountsLoaded: true,
        statusesLoaded: true,
        groupsLoaded: true,
        hashtagsLoaded: true,
      }));

      state.set('submitted', true);
      state.set('next', next);
    }
  });
};

const paginateResults = (state: State, searchType: SearchFilter, results: APIEntity, searchTerm: string, next: string | null) => {
  return state.withMutations(state => {
    if (state.value === searchTerm) {
      state.setIn(['results', `${searchType}HasMore`], results[searchType].length >= 20);
      state.setIn(['results', `${searchType}Loaded`], true);
      state.set('next', next);
      state.updateIn(['results', searchType], items => {
        const data = results[searchType];
        // Hashtags are a list of maps. Others are IDs.
        if (searchType === 'hashtags') {
          return (items as ImmutableOrderedSet<string>).concat((fromJS(data) as Record<string, any>).map(normalizeTag));
        } else {
          return (items as ImmutableOrderedSet<string>).concat(toIds(data));
        }
      });
    }
  });
};

const handleSubmitted = (state: State, value: string) => {
  return state.withMutations(state => {
    state.set('results', ResultsRecord());
    state.set('submitted', true);
    state.set('submittedValue', value);
  });
};

export default function search(state = ReducerRecord(), action: AnyAction) {
  switch (action.type) {
    case SEARCH_CHANGE:
      return state.set('value', action.value);
    case SEARCH_CLEAR:
      return ReducerRecord();
    case SEARCH_RESULTS_CLEAR:
      return state.merge({
        value: '',
        results: ResultsRecord(),
        submitted: false,
        submittedValue: '',
      });
    case SEARCH_SHOW:
      return state.set('hidden', false);
    case COMPOSE_REPLY:
    case COMPOSE_MENTION:
    case COMPOSE_DIRECT:
    case COMPOSE_QUOTE:
      return state.set('hidden', true);
    case SEARCH_FETCH_REQUEST:
      return handleSubmitted(state, action.value);
    case SEARCH_FETCH_SUCCESS:
      return importResults(state, action.results, action.searchTerm, action.searchType, action.next);
    case SEARCH_FILTER_SET:
      return state.set('filter', action.value);
    case SEARCH_EXPAND_REQUEST:
      return state.setIn(['results', `${action.searchType}Loaded`], false);
    case SEARCH_EXPAND_SUCCESS:
      return paginateResults(state, action.searchType, action.results, action.searchTerm, action.next);
    case SEARCH_ACCOUNT_SET:
      if (!action.accountId) return state.merge({
        results: ResultsRecord(),
        submitted: false,
        submittedValue: '',
        filter: 'accounts',
        accountId: null,
      });
      return ReducerRecord({ accountId: action.accountId, filter: 'statuses' });
    default:
      return state;
  }
}
