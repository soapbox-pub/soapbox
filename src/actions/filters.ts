import { defineMessages } from 'react-intl';

import toast from 'soapbox/toast';
import { isLoggedIn } from 'soapbox/utils/auth';
import { getFeatures } from 'soapbox/utils/features';

import api from '../api';

import type { AppDispatch, RootState } from 'soapbox/store';

const FILTERS_FETCH_REQUEST = 'FILTERS_FETCH_REQUEST';
const FILTERS_FETCH_SUCCESS = 'FILTERS_FETCH_SUCCESS';
const FILTERS_FETCH_FAIL    = 'FILTERS_FETCH_FAIL';

const FILTER_FETCH_REQUEST = 'FILTER_FETCH_REQUEST';
const FILTER_FETCH_SUCCESS = 'FILTER_FETCH_SUCCESS';
const FILTER_FETCH_FAIL    = 'FILTER_FETCH_FAIL';

const FILTERS_CREATE_REQUEST = 'FILTERS_CREATE_REQUEST';
const FILTERS_CREATE_SUCCESS = 'FILTERS_CREATE_SUCCESS';
const FILTERS_CREATE_FAIL    = 'FILTERS_CREATE_FAIL';

const FILTERS_UPDATE_REQUEST = 'FILTERS_UPDATE_REQUEST';
const FILTERS_UPDATE_SUCCESS = 'FILTERS_UPDATE_SUCCESS';
const FILTERS_UPDATE_FAIL    = 'FILTERS_UPDATE_FAIL';

const FILTERS_DELETE_REQUEST = 'FILTERS_DELETE_REQUEST';
const FILTERS_DELETE_SUCCESS = 'FILTERS_DELETE_SUCCESS';
const FILTERS_DELETE_FAIL    = 'FILTERS_DELETE_FAIL';

const messages = defineMessages({
  added: { id: 'filters.added', defaultMessage: 'Filter added.' },
  removed: { id: 'filters.removed', defaultMessage: 'Filter deleted.' },
});

type FilterKeywords = { keyword: string, whole_word: boolean }[];

const fetchFiltersV1 = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({
      type: FILTERS_FETCH_REQUEST,
      skipLoading: true,
    });

    return api(getState)
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

const fetchFiltersV2 = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({
      type: FILTERS_FETCH_REQUEST,
      skipLoading: true,
    });

    return api(getState)
      .get('/api/v2/filters')
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

const fetchFilters = (fromFiltersPage = false) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    const state = getState();
    const instance = state.instance;
    const features = getFeatures(instance);

    if (features.filtersV2 && fromFiltersPage) return dispatch(fetchFiltersV2());

    if (features.filters) return dispatch(fetchFiltersV1());
  };

const fetchFilterV1 = (id: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({
      type: FILTER_FETCH_REQUEST,
      skipLoading: true,
    });

    return api(getState)
      .get(`/api/v1/filters/${id}`)
      .then(({ data }) => dispatch({
        type: FILTER_FETCH_SUCCESS,
        filter: data,
        skipLoading: true,
      }))
      .catch(err => dispatch({
        type: FILTER_FETCH_FAIL,
        err,
        skipLoading: true,
        skipAlert: true,
      }));
  };

const fetchFilterV2 = (id: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({
      type: FILTER_FETCH_REQUEST,
      skipLoading: true,
    });

    return api(getState)
      .get(`/api/v2/filters/${id}`)
      .then(({ data }) => dispatch({
        type: FILTER_FETCH_SUCCESS,
        filter: data,
        skipLoading: true,
      }))
      .catch(err => dispatch({
        type: FILTER_FETCH_FAIL,
        err,
        skipLoading: true,
        skipAlert: true,
      }));
  };

const fetchFilter = (id: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const instance = state.instance;
    const features = getFeatures(instance);

    if (features.filtersV2) return dispatch(fetchFilterV2(id));

    if (features.filters) return dispatch(fetchFilterV1(id));
  };

const createFilterV1 = (title: string, expires_in: string | null, context: Array<string>, hide: boolean, keywords: FilterKeywords) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: FILTERS_CREATE_REQUEST });
    return api(getState).post('/api/v1/filters', {
      phrase: keywords[0].keyword,
      context,
      irreversible: hide,
      whole_word: keywords[0].whole_word,
      expires_in,
    }).then(response => {
      dispatch({ type: FILTERS_CREATE_SUCCESS, filter: response.data });
      toast.success(messages.added);
    }).catch(error => {
      dispatch({ type: FILTERS_CREATE_FAIL, error });
    });
  };

const createFilterV2 = (title: string, expires_in: string | null, context: Array<string>, hide: boolean, keywords_attributes: FilterKeywords) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: FILTERS_CREATE_REQUEST });
    return api(getState).post('/api/v2/filters', {
      title,
      context,
      filter_action: hide ? 'hide' : 'warn',
      expires_in,
      keywords_attributes,
    }).then(response => {
      dispatch({ type: FILTERS_CREATE_SUCCESS, filter: response.data });
      toast.success(messages.added);
    }).catch(error => {
      dispatch({ type: FILTERS_CREATE_FAIL, error });
    });
  };

const createFilter = (title: string, expires_in: string | null, context: Array<string>, hide: boolean, keywords: FilterKeywords) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const instance = state.instance;
    const features = getFeatures(instance);

    if (features.filtersV2) return dispatch(createFilterV2(title, expires_in, context, hide, keywords));

    return dispatch(createFilterV1(title, expires_in, context, hide, keywords));
  };

const updateFilterV1 = (id: string, title: string, expires_in: string | null, context: Array<string>, hide: boolean, keywords: FilterKeywords) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: FILTERS_UPDATE_REQUEST });
    return api(getState).patch(`/api/v1/filters/${id}`, {
      phrase: keywords[0].keyword,
      context,
      irreversible: hide,
      whole_word: keywords[0].whole_word,
      expires_in,
    }).then(response => {
      dispatch({ type: FILTERS_UPDATE_SUCCESS, filter: response.data });
      toast.success(messages.added);
    }).catch(error => {
      dispatch({ type: FILTERS_UPDATE_FAIL, error });
    });
  };

const updateFilterV2 = (id: string, title: string, expires_in: string | null, context: Array<string>, hide: boolean, keywords_attributes: FilterKeywords) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: FILTERS_UPDATE_REQUEST });
    return api(getState).patch(`/api/v2/filters/${id}`, {
      title,
      context,
      filter_action: hide ? 'hide' : 'warn',
      expires_in,
      keywords_attributes,
    }).then(response => {
      dispatch({ type: FILTERS_UPDATE_SUCCESS, filter: response.data });
      toast.success(messages.added);
    }).catch(error => {
      dispatch({ type: FILTERS_UPDATE_FAIL, error });
    });
  };

const updateFilter = (id: string, title: string, expires_in: string | null, context: Array<string>, hide: boolean, keywords: FilterKeywords) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const instance = state.instance;
    const features = getFeatures(instance);

    if (features.filtersV2) return dispatch(updateFilterV2(id, title, expires_in, context, hide, keywords));

    return dispatch(updateFilterV1(id, title, expires_in, context, hide, keywords));
  };

const deleteFilterV1 = (id: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: FILTERS_DELETE_REQUEST });
    return api(getState).delete(`/api/v1/filters/${id}`).then(response => {
      dispatch({ type: FILTERS_DELETE_SUCCESS, filter: response.data });
      toast.success(messages.removed);
    }).catch(error => {
      dispatch({ type: FILTERS_DELETE_FAIL, error });
    });
  };

const deleteFilterV2 = (id: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: FILTERS_DELETE_REQUEST });
    return api(getState).delete(`/api/v2/filters/${id}`).then(response => {
      dispatch({ type: FILTERS_DELETE_SUCCESS, filter: response.data });
      toast.success(messages.removed);
    }).catch(error => {
      dispatch({ type: FILTERS_DELETE_FAIL, error });
    });
  };

const deleteFilter = (id: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const instance = state.instance;
    const features = getFeatures(instance);

    if (features.filtersV2) return dispatch(deleteFilterV2(id));

    return dispatch(deleteFilterV1(id));
  };

export {
  FILTERS_FETCH_REQUEST,
  FILTERS_FETCH_SUCCESS,
  FILTERS_FETCH_FAIL,
  FILTER_FETCH_REQUEST,
  FILTER_FETCH_SUCCESS,
  FILTER_FETCH_FAIL,
  FILTERS_CREATE_REQUEST,
  FILTERS_CREATE_SUCCESS,
  FILTERS_CREATE_FAIL,
  FILTERS_UPDATE_REQUEST,
  FILTERS_UPDATE_SUCCESS,
  FILTERS_UPDATE_FAIL,
  FILTERS_DELETE_REQUEST,
  FILTERS_DELETE_SUCCESS,
  FILTERS_DELETE_FAIL,
  fetchFilters,
  fetchFilter,
  createFilter,
  updateFilter,
  deleteFilter,
};
