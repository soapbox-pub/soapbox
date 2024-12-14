import api from '../api/index.ts';

import type { AppDispatch, RootState } from 'soapbox/store.ts';
import type { APIEntity } from 'soapbox/types/entities.ts';

const MARKER_FETCH_REQUEST = 'MARKER_FETCH_REQUEST';
const MARKER_FETCH_SUCCESS = 'MARKER_FETCH_SUCCESS';
const MARKER_FETCH_FAIL    = 'MARKER_FETCH_FAIL';

const MARKER_SAVE_REQUEST = 'MARKER_SAVE_REQUEST';
const MARKER_SAVE_SUCCESS = 'MARKER_SAVE_SUCCESS';
const MARKER_SAVE_FAIL    = 'MARKER_SAVE_FAIL';

const fetchMarker = (timeline: Array<string>) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: MARKER_FETCH_REQUEST });
    return api(getState).get('/api/v1/markers', { searchParams: { timeline } }).then((response) => response.json()).then((marker) => {
      dispatch({ type: MARKER_FETCH_SUCCESS, marker });
    }).catch(error => {
      dispatch({ type: MARKER_FETCH_FAIL, error });
    });
  };

const saveMarker = (marker: APIEntity) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: MARKER_SAVE_REQUEST, marker });
    return api(getState).post('/api/v1/markers', marker).then((response) => response.json()).then((marker) => {
      dispatch({ type: MARKER_SAVE_SUCCESS, marker });
    }).catch(error => {
      dispatch({ type: MARKER_SAVE_FAIL, error });
    });
  };

export {
  MARKER_FETCH_REQUEST,
  MARKER_FETCH_SUCCESS,
  MARKER_FETCH_FAIL,
  MARKER_SAVE_REQUEST,
  MARKER_SAVE_SUCCESS,
  MARKER_SAVE_FAIL,
  fetchMarker,
  saveMarker,
};
