import { isLoggedIn } from 'soapbox/utils/auth.ts';

import api from '../api/index.ts';

import { importFetchedStatuses } from './importer/index.ts';

import type { AppDispatch, RootState } from 'soapbox/store.ts';
import type { APIEntity } from 'soapbox/types/entities.ts';

const PINNED_STATUSES_FETCH_REQUEST = 'PINNED_STATUSES_FETCH_REQUEST';
const PINNED_STATUSES_FETCH_SUCCESS = 'PINNED_STATUSES_FETCH_SUCCESS';
const PINNED_STATUSES_FETCH_FAIL = 'PINNED_STATUSES_FETCH_FAIL';

const fetchPinnedStatuses = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;
    const me = getState().me;

    dispatch(fetchPinnedStatusesRequest());

    api(getState).get(`/api/v1/accounts/${me}/statuses`, { searchParams: { pinned: true } }).then((response) => response.json()).then((data) => {
      dispatch(importFetchedStatuses(data));
      dispatch(fetchPinnedStatusesSuccess(data, null));
    }).catch(error => {
      dispatch(fetchPinnedStatusesFail(error));
    });
  };

const fetchPinnedStatusesRequest = () => ({
  type: PINNED_STATUSES_FETCH_REQUEST,
});

const fetchPinnedStatusesSuccess = (statuses: APIEntity[], next: string | null) => ({
  type: PINNED_STATUSES_FETCH_SUCCESS,
  statuses,
  next,
});

const fetchPinnedStatusesFail = (error: unknown) => ({
  type: PINNED_STATUSES_FETCH_FAIL,
  error,
});

export {
  PINNED_STATUSES_FETCH_REQUEST,
  PINNED_STATUSES_FETCH_SUCCESS,
  PINNED_STATUSES_FETCH_FAIL,
  fetchPinnedStatuses,
  fetchPinnedStatusesRequest,
  fetchPinnedStatusesSuccess,
  fetchPinnedStatusesFail,
};
