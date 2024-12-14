import { isLoggedIn } from 'soapbox/utils/auth.ts';

import api from '../api/index.ts';

import { fetchRelationships } from './accounts.ts';
import { importFetchedAccounts } from './importer/index.ts';

import type { AppDispatch, RootState } from 'soapbox/store.ts';

const BLOCKS_FETCH_REQUEST = 'BLOCKS_FETCH_REQUEST';
const BLOCKS_FETCH_SUCCESS = 'BLOCKS_FETCH_SUCCESS';
const BLOCKS_FETCH_FAIL = 'BLOCKS_FETCH_FAIL';

const BLOCKS_EXPAND_REQUEST = 'BLOCKS_EXPAND_REQUEST';
const BLOCKS_EXPAND_SUCCESS = 'BLOCKS_EXPAND_SUCCESS';
const BLOCKS_EXPAND_FAIL = 'BLOCKS_EXPAND_FAIL';

const fetchBlocks = () => (dispatch: AppDispatch, getState: () => RootState) => {
  if (!isLoggedIn(getState)) return null;

  dispatch(fetchBlocksRequest());

  return api(getState)
    .get('/api/v1/blocks')
    .then(async (response) => {
      const next = response.next();
      const data = await response.json();
      dispatch(importFetchedAccounts(data));
      dispatch(fetchBlocksSuccess(data, next));
      dispatch(fetchRelationships(data.map((item: any) => item.id)) as any);
    })
    .catch(error => dispatch(fetchBlocksFail(error)));
};

function fetchBlocksRequest() {
  return { type: BLOCKS_FETCH_REQUEST };
}

function fetchBlocksSuccess(accounts: any, next: any) {
  return {
    type: BLOCKS_FETCH_SUCCESS,
    accounts,
    next,
  };
}

function fetchBlocksFail(error: unknown) {
  return {
    type: BLOCKS_FETCH_FAIL,
    error,
  };
}

const expandBlocks = () => (dispatch: AppDispatch, getState: () => RootState) => {
  if (!isLoggedIn(getState)) return null;

  const url = getState().user_lists.blocks.next;

  if (url === null) {
    return null;
  }

  dispatch(expandBlocksRequest());

  return api(getState)
    .get(url)
    .then(async (response) => {
      const next = response.next();
      const data = await response.json();
      dispatch(importFetchedAccounts(data));
      dispatch(expandBlocksSuccess(data, next));
      dispatch(fetchRelationships(data.map((item: any) => item.id)) as any);
    })
    .catch(error => dispatch(expandBlocksFail(error)));
};

function expandBlocksRequest() {
  return {
    type: BLOCKS_EXPAND_REQUEST,
  };
}

function expandBlocksSuccess(accounts: any, next: any) {
  return {
    type: BLOCKS_EXPAND_SUCCESS,
    accounts,
    next,
  };
}

function expandBlocksFail(error: unknown) {
  return {
    type: BLOCKS_EXPAND_FAIL,
    error,
  };
}

export {
  fetchBlocks,
  expandBlocks,
  BLOCKS_FETCH_REQUEST,
  BLOCKS_FETCH_SUCCESS,
  BLOCKS_FETCH_FAIL,
  BLOCKS_EXPAND_REQUEST,
  BLOCKS_EXPAND_SUCCESS,
  BLOCKS_EXPAND_FAIL,
};
