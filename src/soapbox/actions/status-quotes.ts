import api, { getLinks } from '../api';

import { importFetchedStatuses } from './importer';

import type { AppDispatch, RootState } from 'soapbox/store';

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

    return api(getState).get(`/api/v1/pleroma/statuses/${statusId}/quotes`).then(response => {
      const next = getLinks(response).refs.find(link => link.rel === 'next');
      dispatch(importFetchedStatuses(response.data));
      return dispatch({
        type: STATUS_QUOTES_FETCH_SUCCESS,
        statusId,
        statuses: response.data,
        next: next ? next.uri : null,
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

    return api(getState).get(url).then(response => {
      const next = getLinks(response).refs.find(link => link.rel === 'next');
      dispatch(importFetchedStatuses(response.data));
      dispatch({
        type: STATUS_QUOTES_EXPAND_SUCCESS,
        statusId,
        statuses: response.data,
        next: next ? next.uri : null,
      });
    }).catch(error => {
      dispatch({
        type: STATUS_QUOTES_EXPAND_FAIL,
        statusId,
        error,
      });
    });
  };
