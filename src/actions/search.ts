import api from '../api/index.ts';

import { fetchRelationships } from './accounts.ts';
import { importFetchedAccounts, importFetchedStatuses } from './importer/index.ts';

import type { SearchFilter } from 'soapbox/reducers/search.ts';
import type { AppDispatch, RootState } from 'soapbox/store.ts';
import type { APIEntity } from 'soapbox/types/entities.ts';

const SEARCH_CHANGE        = 'SEARCH_CHANGE';
const SEARCH_CLEAR         = 'SEARCH_CLEAR';
const SEARCH_SHOW          = 'SEARCH_SHOW';
const SEARCH_RESULTS_CLEAR = 'SEARCH_RESULTS_CLEAR';

const SEARCH_FETCH_REQUEST = 'SEARCH_FETCH_REQUEST';
const SEARCH_FETCH_SUCCESS = 'SEARCH_FETCH_SUCCESS';
const SEARCH_FETCH_FAIL    = 'SEARCH_FETCH_FAIL';

const SEARCH_FILTER_SET = 'SEARCH_FILTER_SET';

const SEARCH_EXPAND_REQUEST = 'SEARCH_EXPAND_REQUEST';
const SEARCH_EXPAND_SUCCESS = 'SEARCH_EXPAND_SUCCESS';
const SEARCH_EXPAND_FAIL    = 'SEARCH_EXPAND_FAIL';

const SEARCH_ACCOUNT_SET = 'SEARCH_ACCOUNT_SET';

const changeSearch = (value: string) =>
  (dispatch: AppDispatch) => {
    // If backspaced all the way, clear the search
    if (value.length === 0) {
      dispatch(clearSearchResults());
      return dispatch({
        type: SEARCH_CHANGE,
        value,
      });
    } else {
      return dispatch({
        type: SEARCH_CHANGE,
        value,
      });
    }
  };

const clearSearch = () => ({
  type: SEARCH_CLEAR,
});

const clearSearchResults = () => ({
  type: SEARCH_RESULTS_CLEAR,
});

const submitSearch = (filter?: SearchFilter) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const value = getState().search.value;
    const type = filter || getState().search.filter || 'statuses';
    const accountId = getState().search.accountId;

    // An empty search doesn't return any results
    if (value.length === 0) {
      return;
    }

    dispatch(fetchSearchRequest(value));

    const params: Record<string, any> = {
      q: value,
      resolve: true,
      limit: 20,
      type,
    };

    if (accountId) params.account_id = accountId;

    api(getState).get('/api/v2/search', {
      searchParams: params,
    }).then(async (response) => {
      const next = response.next();
      const data = await response.json();

      if (data.accounts) {
        dispatch(importFetchedAccounts(data.accounts));
      }

      if (data.statuses) {
        dispatch(importFetchedStatuses(data.statuses));
      }

      dispatch(fetchSearchSuccess(data, value, type, next));
      dispatch(fetchRelationships(data.accounts.map((item: APIEntity) => item.id)));
    }).catch(error => {
      dispatch(fetchSearchFail(error));
    });
  };

const fetchSearchRequest = (value: string) => ({
  type: SEARCH_FETCH_REQUEST,
  value,
});

const fetchSearchSuccess = (results: APIEntity[], searchTerm: string, searchType: SearchFilter, next: string | null) => ({
  type: SEARCH_FETCH_SUCCESS,
  results,
  searchTerm,
  searchType,
  next,
});

const fetchSearchFail = (error: unknown) => ({
  type: SEARCH_FETCH_FAIL,
  error,
});

const setFilter = (filterType: SearchFilter) =>
  (dispatch: AppDispatch) => {
    dispatch(submitSearch(filterType));

    dispatch({
      type: SEARCH_FILTER_SET,
      path: ['search', 'filter'],
      value: filterType,
    });
  };

const expandSearch = (type: SearchFilter) => (dispatch: AppDispatch, getState: () => RootState) => {
  const value     = getState().search.value;
  const offset    = getState().search.results[type].size;
  const accountId = getState().search.accountId;

  dispatch(expandSearchRequest(type));

  let url = getState().search.next as string;
  let params: Record<string, any> = {};

  // if no URL was extracted from the Link header,
  // fall back on querying with the offset
  if (!url) {
    url = '/api/v2/search';
    params = {
      q: value,
      type,
      offset,
    };
    if (accountId) params.account_id = accountId;
  }

  api(getState).get(url, {
    searchParams: params,
  }).then(async (response) => {
    const next = response.next();
    const data = await response.json();

    if (data.accounts) {
      dispatch(importFetchedAccounts(data.accounts));
    }

    if (data.statuses) {
      dispatch(importFetchedStatuses(data.statuses));
    }

    dispatch(expandSearchSuccess(data, value, type, next));
    dispatch(fetchRelationships(data.accounts.map((item: APIEntity) => item.id)));
  }).catch(error => {
    dispatch(expandSearchFail(error));
  });
};

const expandSearchRequest = (searchType: SearchFilter) => ({
  type: SEARCH_EXPAND_REQUEST,
  searchType,
});

const expandSearchSuccess = (results: APIEntity[], searchTerm: string, searchType: SearchFilter, next: string | null) => ({
  type: SEARCH_EXPAND_SUCCESS,
  results,
  searchTerm,
  searchType,
  next,
});

const expandSearchFail = (error: unknown) => ({
  type: SEARCH_EXPAND_FAIL,
  error,
});

const showSearch = () => ({
  type: SEARCH_SHOW,
});

const setSearchAccount = (accountId: string | null) => ({
  type: SEARCH_ACCOUNT_SET,
  accountId,
});

export {
  SEARCH_CHANGE,
  SEARCH_CLEAR,
  SEARCH_SHOW,
  SEARCH_RESULTS_CLEAR,
  SEARCH_FETCH_REQUEST,
  SEARCH_FETCH_SUCCESS,
  SEARCH_FETCH_FAIL,
  SEARCH_FILTER_SET,
  SEARCH_EXPAND_REQUEST,
  SEARCH_EXPAND_SUCCESS,
  SEARCH_EXPAND_FAIL,
  SEARCH_ACCOUNT_SET,
  changeSearch,
  clearSearch,
  clearSearchResults,
  submitSearch,
  fetchSearchRequest,
  fetchSearchSuccess,
  fetchSearchFail,
  setFilter,
  expandSearch,
  expandSearchRequest,
  expandSearchSuccess,
  expandSearchFail,
  showSearch,
  setSearchAccount,
};
