import { normalizeTag } from '@/normalizers/index.ts';

import {
  COMPOSE_MENTION,
  COMPOSE_REPLY,
  COMPOSE_DIRECT,
  COMPOSE_QUOTE,
} from '../actions/compose.ts';
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
} from '../actions/search.ts';

import type { APIEntity, Tag } from '@/types/entities.ts';
import type { AnyAction } from 'redux';

interface Results {
  accounts: string[];
  statuses: string[];
  groups: string[];
  hashtags: Tag[];
  accountsHasMore: boolean;
  statusesHasMore: boolean;
  groupsHasMore: boolean;
  hashtagsHasMore: boolean;
  accountsLoaded: boolean;
  statusesLoaded: boolean;
  groupsLoaded: boolean;
  hashtagsLoaded: boolean;
}

interface State {
  value: string;
  submitted: boolean;
  submittedValue: string;
  hidden: boolean;
  results: Results;
  filter: SearchFilter;
  accountId: string | null;
  next: string | null;
}

const initialResults: Results = {
  accounts: [],
  statuses: [],
  groups: [],
  hashtags: [],
  accountsHasMore: false,
  statusesHasMore: false,
  groupsHasMore: false,
  hashtagsHasMore: false,
  accountsLoaded: false,
  statusesLoaded: false,
  groupsLoaded: false,
  hashtagsLoaded: false,
};

const initialState: State = {
  value: '',
  submitted: false,
  submittedValue: '',
  hidden: false,
  results: initialResults,
  filter: 'statuses',
  accountId: null,
  next: null,
};

type APIEntities = Array<APIEntity>;
export type SearchFilter = 'statuses' | 'accounts' | 'groups' | 'hashtags';

const toIds = (items: APIEntities = []): string[] => {
  return [...new Set(items.map(item => item.id as string))];
};

const importResults = (state: State, results: APIEntity, searchTerm: string, searchType: SearchFilter, next: string | null): State => {
  if (state.value === searchTerm && state.filter === searchType) {
    return {
      ...state,
      results: {
        statuses: toIds(results.statuses),
        accounts: toIds(results.accounts),
        groups: toIds(results.groups),
        hashtags: results.hashtags.map(normalizeTag),
        accountsHasMore: results.accounts.length >= 20,
        statusesHasMore: results.statuses.length >= 20,
        groupsHasMore: results.groups?.length >= 20,
        hashtagsHasMore: results.hashtags.length >= 20,
        accountsLoaded: true,
        statusesLoaded: true,
        groupsLoaded: true,
        hashtagsLoaded: true,
      },
      submitted: true,
      next,
    };
  }

  return state;
};

const paginateResults = (state: State, searchType: SearchFilter, results: APIEntity, searchTerm: string, next: string | null): State => {
  if (state.value === searchTerm) {
    const data = results[searchType];

    return {
      ...state,
      next,
      results: {
        ...state.results,
        [`${searchType}HasMore`]: data.length >= 20,
        [`${searchType}Loaded`]: true,
        // Hashtags are a list of maps. Others are IDs.
        [searchType]: searchType === 'hashtags'
          ? [...state.results.hashtags, ...data.map(normalizeTag)]
          : [...new Set([...state.results[searchType], ...toIds(data)])],
      },
    };
  }

  return state;
};

const handleSubmitted = (state: State, value: string): State => {
  return {
    ...state,
    results: initialResults,
    submitted: true,
    submittedValue: value,
  };
};

export default function search(state: State = initialState, action: AnyAction): State {
  switch (action.type) {
    case SEARCH_CHANGE:
      return { ...state, value: action.value };
    case SEARCH_CLEAR:
      return initialState;
    case SEARCH_RESULTS_CLEAR:
      return {
        ...state,
        value: '',
        results: initialResults,
        submitted: false,
        submittedValue: '',
      };
    case SEARCH_SHOW:
      return { ...state, hidden: false };
    case COMPOSE_REPLY:
    case COMPOSE_MENTION:
    case COMPOSE_DIRECT:
    case COMPOSE_QUOTE:
      return { ...state, hidden: true };
    case SEARCH_FETCH_REQUEST:
      return handleSubmitted(state, action.value);
    case SEARCH_FETCH_SUCCESS:
      return importResults(state, action.results, action.searchTerm, action.searchType, action.next);
    case SEARCH_FILTER_SET:
      return { ...state, filter: action.value };
    case SEARCH_EXPAND_REQUEST:
      return { ...state, results: { ...state.results, [`${action.searchType}Loaded`]: false } };
    case SEARCH_EXPAND_SUCCESS:
      return paginateResults(state, action.searchType, action.results, action.searchTerm, action.next);
    case SEARCH_ACCOUNT_SET:
      if (!action.accountId) return {
        ...state,
        results: initialResults,
        submitted: false,
        submittedValue: '',
        filter: 'statuses',
        accountId: null,
      };
      return { ...initialState, accountId: action.accountId, filter: 'statuses' };
    default:
      return state;
  }
}
