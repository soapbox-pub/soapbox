import { APIEntity } from 'soapbox/types/entities.ts';
import { getFeatures } from 'soapbox/utils/features.ts';

import api from '../api/index.ts';

import { importFetchedStatuses } from './importer/index.ts';

import type { AppDispatch, RootState } from 'soapbox/store.ts';

const TRENDING_STATUSES_FETCH_REQUEST = 'TRENDING_STATUSES_FETCH_REQUEST';
const TRENDING_STATUSES_FETCH_SUCCESS = 'TRENDING_STATUSES_FETCH_SUCCESS';
const TRENDING_STATUSES_FETCH_FAIL    = 'TRENDING_STATUSES_FETCH_FAIL';
const TRENDING_STATUSES_EXPAND_FAIL = 'TRENDING_STATUSES_EXPAND_FAIL';
const TRENDING_STATUSES_EXPAND_SUCCESS = 'TRENDING_STATUSES_EXPAND_SUCCESS';

const fetchTrendingStatuses = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();

    const instance = state.instance;
    const features = getFeatures(instance);

    if (!features.trendingStatuses) return;

    dispatch({ type: TRENDING_STATUSES_FETCH_REQUEST });
    return api(getState).get('/api/v1/trends/statuses').then(async (response) => {
      const next = response.next();
      const data = await response.json();

      const statuses = data;

      dispatch(importFetchedStatuses(statuses));
      dispatch(fetchTrendingStatusesSuccess(statuses, next));
      return statuses;
    }).catch(error => {
      dispatch(fetchTrendingStatusesFail(error));
    });
  };

const fetchTrendingStatusesSuccess = (statuses: APIEntity[], next: string | null) => ({
  type: TRENDING_STATUSES_FETCH_SUCCESS,
  statuses,
  next,
});


const fetchTrendingStatusesFail = (error: unknown) => ({
  type: TRENDING_STATUSES_FETCH_FAIL,
  error,
});

const expandTrendingStatuses = (path: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    api(getState).get(path).then(async (response) => {
      const next = response.next();
      const data = await response.json();

      const statuses = data;

      dispatch(importFetchedStatuses(statuses));
      dispatch(expandTrendingStatusesSuccess(statuses, next));
    }).catch(error => {
      dispatch(expandTrendingStatusesFail(error));
    });
  };

const expandTrendingStatusesSuccess = (statuses: APIEntity[], next: string | null) => ({
  type: TRENDING_STATUSES_EXPAND_SUCCESS,
  statuses,
  next,
});

const expandTrendingStatusesFail = (error: unknown) => ({
  type: TRENDING_STATUSES_EXPAND_FAIL,
  error,
});

export {
  TRENDING_STATUSES_FETCH_REQUEST,
  TRENDING_STATUSES_FETCH_SUCCESS,
  TRENDING_STATUSES_FETCH_FAIL,
  TRENDING_STATUSES_EXPAND_SUCCESS,
  TRENDING_STATUSES_EXPAND_FAIL,
  fetchTrendingStatuses,
  expandTrendingStatuses,
};
