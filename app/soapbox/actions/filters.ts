import { defineMessages } from 'react-intl';

import snackbar from 'soapbox/actions/snackbar';
import { isLoggedIn } from 'soapbox/utils/auth';

import api from '../api';

import type { AppDispatch, RootState } from 'soapbox/store';

const FILTERS_FETCH_REQUEST = 'FILTERS_FETCH_REQUEST';
const FILTERS_FETCH_SUCCESS = 'FILTERS_FETCH_SUCCESS';
const FILTERS_FETCH_FAIL    = 'FILTERS_FETCH_FAIL';

const FILTERS_CREATE_REQUEST = 'FILTERS_CREATE_REQUEST';
const FILTERS_CREATE_SUCCESS = 'FILTERS_CREATE_SUCCESS';
const FILTERS_CREATE_FAIL    = 'FILTERS_CREATE_FAIL';

const FILTERS_DELETE_REQUEST = 'FILTERS_DELETE_REQUEST';
const FILTERS_DELETE_SUCCESS = 'FILTERS_DELETE_SUCCESS';
const FILTERS_DELETE_FAIL    = 'FILTERS_DELETE_FAIL';

const messages = defineMessages({
  added: { id: 'filters.added', defaultMessage: 'Filter added.' },
  removed: { id: 'filters.removed', defaultMessage: 'Filter deleted.' },
});

const fetchFilters = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    dispatch({
      type: FILTERS_FETCH_REQUEST,
      skipLoading: true,
    });

    api(getState)
      .get('/api/v1/filters')
      .then(({ data }) => dispatch({
        type: FILTERS_FETCH_SUCCESS,
        filters: data,
        skipLoading: true,
      }))
      .catch(err => dispatch({
        type: FILTERS_FETCH_FAIL,
        err,
        skipLoading: true,
        skipAlert: true,
      }));
  };

const createFilter = (phrase: string, expires_at: string, context: Array<string>, whole_word: boolean, irreversible: boolean) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: FILTERS_CREATE_REQUEST });
    return api(getState).post('/api/v1/filters', {
      phrase,
      context,
      irreversible,
      whole_word,
      expires_at,
    }).then(response => {
      dispatch({ type: FILTERS_CREATE_SUCCESS, filter: response.data });
      dispatch(snackbar.success(messages.added));
    }).catch(error => {
      dispatch({ type: FILTERS_CREATE_FAIL, error });
    });
  };


const deleteFilter = (id: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: FILTERS_DELETE_REQUEST });
    return api(getState).delete(`/api/v1/filters/${id}`).then(response => {
      dispatch({ type: FILTERS_DELETE_SUCCESS, filter: response.data });
      dispatch(snackbar.success(messages.removed));
    }).catch(error => {
      dispatch({ type: FILTERS_DELETE_FAIL, error });
    });
  };

export {
  FILTERS_FETCH_REQUEST,
  FILTERS_FETCH_SUCCESS,
  FILTERS_FETCH_FAIL,
  FILTERS_CREATE_REQUEST,
  FILTERS_CREATE_SUCCESS,
  FILTERS_CREATE_FAIL,
  FILTERS_DELETE_REQUEST,
  FILTERS_DELETE_SUCCESS,
  FILTERS_DELETE_FAIL,
  fetchFilters,
  createFilter,
  deleteFilter,
};