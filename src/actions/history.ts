import api from 'soapbox/api/index.ts';

import { importFetchedAccounts } from './importer/index.ts';

import type { AppDispatch, RootState } from 'soapbox/store.ts';
import type { APIEntity } from 'soapbox/types/entities.ts';

const HISTORY_FETCH_REQUEST = 'HISTORY_FETCH_REQUEST';
const HISTORY_FETCH_SUCCESS = 'HISTORY_FETCH_SUCCESS';
const HISTORY_FETCH_FAIL    = 'HISTORY_FETCH_FAIL';

const fetchHistory = (statusId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const loading = getState().history.getIn([statusId, 'loading']);

    if (loading) {
      return;
    }

    dispatch(fetchHistoryRequest(statusId));

    api(getState).get(`/api/v1/statuses/${statusId}/history`).then((response) => response.json()).then((data) => {
      dispatch(importFetchedAccounts(data.map((x: APIEntity) => x.account)));
      dispatch(fetchHistorySuccess(statusId, data));
    }).catch(error => dispatch(fetchHistoryFail(error)));
  };

const fetchHistoryRequest = (statusId: string) => ({
  type: HISTORY_FETCH_REQUEST,
  statusId,
});

const fetchHistorySuccess = (statusId: String, history: APIEntity[]) => ({
  type: HISTORY_FETCH_SUCCESS,
  statusId,
  history,
});

const fetchHistoryFail = (error: unknown) => ({
  type: HISTORY_FETCH_FAIL,
  error,
});

export {
  HISTORY_FETCH_REQUEST,
  HISTORY_FETCH_SUCCESS,
  HISTORY_FETCH_FAIL,
  fetchHistory,
  fetchHistoryRequest,
  fetchHistorySuccess,
  fetchHistoryFail,
};