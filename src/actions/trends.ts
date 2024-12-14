import api from '../api/index.ts';

import type { AppDispatch, RootState } from 'soapbox/store.ts';
import type { APIEntity } from 'soapbox/types/entities.ts';

const TRENDS_FETCH_REQUEST = 'TRENDS_FETCH_REQUEST';
const TRENDS_FETCH_SUCCESS = 'TRENDS_FETCH_SUCCESS';
const TRENDS_FETCH_FAIL    = 'TRENDS_FETCH_FAIL';

const fetchTrends = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(fetchTrendsRequest());

    api(getState).get('/api/v1/trends').then((response) => response.json()).then(data => {
      dispatch(fetchTrendsSuccess(data));
    }).catch(error => dispatch(fetchTrendsFail(error)));
  };

const fetchTrendsRequest = () => ({
  type: TRENDS_FETCH_REQUEST,
  skipLoading: true,
});

const fetchTrendsSuccess = (tags: APIEntity[]) => ({
  type: TRENDS_FETCH_SUCCESS,
  tags,
  skipLoading: true,
});

const fetchTrendsFail = (error: unknown) => ({
  type: TRENDS_FETCH_FAIL,
  error,
  skipLoading: true,
  skipAlert: true,
});

export {
  TRENDS_FETCH_REQUEST,
  TRENDS_FETCH_SUCCESS,
  TRENDS_FETCH_FAIL,
  fetchTrends,
  fetchTrendsRequest,
  fetchTrendsSuccess,
  fetchTrendsFail,
};
