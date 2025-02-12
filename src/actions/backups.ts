import api from '../api/index.ts';

import type { AppDispatch, RootState } from 'soapbox/store.ts';

export const BACKUPS_FETCH_REQUEST = 'BACKUPS_FETCH_REQUEST';
export const BACKUPS_FETCH_SUCCESS = 'BACKUPS_FETCH_SUCCESS';
export const BACKUPS_FETCH_FAIL    = 'BACKUPS_FETCH_FAIL';

export const BACKUPS_CREATE_REQUEST = 'BACKUPS_CREATE_REQUEST';
export const BACKUPS_CREATE_SUCCESS = 'BACKUPS_CREATE_SUCCESS';
export const BACKUPS_CREATE_FAIL    = 'BACKUPS_CREATE_FAIL';

export const fetchBackups = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: BACKUPS_FETCH_REQUEST });
    return api(getState).get('/api/v1/pleroma/backups').then((response) => response.json()).then((backups) =>
      dispatch({ type: BACKUPS_FETCH_SUCCESS, backups }),
    ).catch(error => {
      dispatch({ type: BACKUPS_FETCH_FAIL, error });
    });
  };

export const createBackup = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: BACKUPS_CREATE_REQUEST });
    return api(getState).post('/api/v1/pleroma/backups').then((response) => response.json()).then((backups) =>
      dispatch({ type: BACKUPS_CREATE_SUCCESS, backups }),
    ).catch(error => {
      dispatch({ type: BACKUPS_CREATE_FAIL, error });
    });
  };
