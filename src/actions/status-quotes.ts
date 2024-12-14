import api from '../api/index.ts';

import { importFetchedStatuses } from './importer/index.ts';

import type { AppDispatch, RootState } from 'soapbox/store.ts';

export const STATUS_QUOTES_FETCH_REQUEST = 'STATUS_QUOTES_FETCH_REQUEST';
export const STATUS_QUOTES_FETCH_SUCCESS = 'STATUS_QUOTES_FETCH_SUCCESS';
export const STATUS_QUOTES_FETCH_FAIL    = 'STATUS_QUOTES_FETCH_FAIL';

export const STATUS_QUOTES_EXPAND_REQUEST = 'STATUS_QUOTES_EXPAND_REQUEST';
export const STATUS_QUOTES_EXPAND_SUCCESS = 'STATUS_QUOTES_EXPAND_SUCCESS';
export const STATUS_QUOTES_EXPAND_FAIL    = 'STATUS_QUOTES_EXPAND_FAIL';

const noOp = () => new Promise(f => f(null));

export const fetchStatusQuotes = (statusId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (getState().status_lists.getIn([`quotes:${statusId}`, 'isLoading'])) {
      return dispatch(noOp);
    }

    dispatch({
      statusId,
      type: STATUS_QUOTES_FETCH_REQUEST,
    });

    return api(getState).get(`/api/v1/pleroma/statuses/${statusId}/quotes`).then(async (response) => {
      const next = response.next();
      const data = await response.json();
      dispatch(importFetchedStatuses(data));
      return dispatch({
        type: STATUS_QUOTES_FETCH_SUCCESS,
        statusId,
        statuses: data,
        next,
      });
    }).catch(error => {
      dispatch({
        type: STATUS_QUOTES_FETCH_FAIL,
        statusId,
        error,
      });
    });
  };

export const expandStatusQuotes = (statusId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const url = getState().status_lists.getIn([`quotes:${statusId}`, 'next'], null) as string | null;

    if (url === null || getState().status_lists.getIn([`quotes:${statusId}`, 'isLoading'])) {
      return dispatch(noOp);
    }

    dispatch({
      type: STATUS_QUOTES_EXPAND_REQUEST,
      statusId,
    });

    return api(getState).get(url).then(async (response)  => {
      const data = await response.json();
      dispatch(importFetchedStatuses(data));
      dispatch({
        type: STATUS_QUOTES_EXPAND_SUCCESS,
        statusId,
        statuses: data,
        next: response.next(),
      });
    }).catch(error => {
      dispatch({
        type: STATUS_QUOTES_EXPAND_FAIL,
        statusId,
        error,
      });
    });
  };
