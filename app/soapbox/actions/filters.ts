import { defineMessages } from 'react-intl';

import toast from 'soapbox/toast';
import { isLoggedIn } from 'soapbox/utils/auth';
import { getFeatures } from 'soapbox/utils/features';

import api from '../api';

import type { AppDispatch, RootState } from 'soapbox/store';

const FILTERS_V1_FETCH_REQUEST = 'FILTERS_V1_FETCH_REQUEST';
const FILTERS_V1_FETCH_SUCCESS = 'FILTERS_V1_FETCH_SUCCESS';
const FILTERS_V1_FETCH_FAIL    = 'FILTERS_V1_FETCH_FAIL';

const FILTERS_V2_FETCH_REQUEST = 'FILTERS_V2_FETCH_REQUEST';
const FILTERS_V2_FETCH_SUCCESS = 'FILTERS_V2_FETCH_SUCCESS';
const FILTERS_V2_FETCH_FAIL    = 'FILTERS_V2_FETCH_FAIL';

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

const fetchFiltersV1 = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({
      type: FILTERS_V1_FETCH_REQUEST,
      skipLoading: true,
    });

    api(getState)
      .get('/api/v1/filters')
      .then(({ data }) => dispatch({
        type: FILTERS_V1_FETCH_SUCCESS,
        filters: data,
        skipLoading: true,
      }))
      .catch(err => dispatch({
        type: FILTERS_V1_FETCH_FAIL,
        err,
        skipLoading: true,
        skipAlert: true,
      }));
  };

const fetchFiltersV2 = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({
      type: FILTERS_V2_FETCH_REQUEST,
      skipLoading: true,
    });

    api(getState)
      .get('/api/v2/filters')
      .then(({ data }) => dispatch({
        type: FILTERS_V2_FETCH_SUCCESS,
        filters: data,
        skipLoading: true,
      }))
      .catch(err => dispatch({
        type: FILTERS_V2_FETCH_FAIL,
        err,
        skipLoading: true,
        skipAlert: true,
      }));
  };

const fetchFilters = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    const state = getState();
    const instance = state.instance;
    const features = getFeatures(instance);

    if (features.filtersV2) return dispatch(fetchFiltersV2());

    if (features.filters) return dispatch(fetchFiltersV1());
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
      toast.success(messages.added);
    }).catch(error => {
      dispatch({ type: FILTERS_CREATE_FAIL, error });
    });
  };

const deleteFilter = (id: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: FILTERS_DELETE_REQUEST });
    return api(getState).delete(`/api/v1/filters/${id}`).then(response => {
      dispatch({ type: FILTERS_DELETE_SUCCESS, filter: response.data });
      toast.success(messages.removed);
    }).catch(error => {
      dispatch({ type: FILTERS_DELETE_FAIL, error });
    });
  };

export {
  FILTERS_V1_FETCH_REQUEST,
  FILTERS_V1_FETCH_SUCCESS,
  FILTERS_V1_FETCH_FAIL,
  FILTERS_V2_FETCH_REQUEST,
  FILTERS_V2_FETCH_SUCCESS,
  FILTERS_V2_FETCH_FAIL,
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
