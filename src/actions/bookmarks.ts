import { isLoggedIn } from '@/utils/auth.ts';

import api from '../api/index.ts';

import { importFetchedStatus, importFetchedStatuses } from './importer/index.ts';

import type { AppDispatch, RootState } from '@/store.ts';
import type { APIEntity, Status } from '@/types/entities.ts';

const BOOKMARKED_STATUSES_FETCH_REQUEST = 'BOOKMARKED_STATUSES_FETCH_REQUEST';
const BOOKMARKED_STATUSES_FETCH_SUCCESS = 'BOOKMARKED_STATUSES_FETCH_SUCCESS';
const BOOKMARKED_STATUSES_FETCH_FAIL    = 'BOOKMARKED_STATUSES_FETCH_FAIL';

const BOOKMARKED_STATUSES_EXPAND_REQUEST = 'BOOKMARKED_STATUSES_EXPAND_REQUEST';
const BOOKMARKED_STATUSES_EXPAND_SUCCESS = 'BOOKMARKED_STATUSES_EXPAND_SUCCESS';
const BOOKMARKED_STATUSES_EXPAND_FAIL    = 'BOOKMARKED_STATUSES_EXPAND_FAIL';

const BOOKMARK_REQUEST = 'BOOKMARK_REQUEST';
const BOOKMARK_SUCCESS = 'BOOKMARK_SUCCESS';
const BOOKMARK_FAIL    = 'BOOKMARK_FAIL';

const UNBOOKMARK_REQUEST = 'UNBOOKMARK_REQUEST';
const UNBOOKMARK_SUCCESS = 'UNBOOKMARK_SUCCESS';
const UNBOOKMARK_FAIL    = 'UNBOOKMARK_FAIL';

const fetchBookmarkedStatuses = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;
    if (getState().status_lists.bookmarks?.isLoading) return;

    dispatch({ type: BOOKMARKED_STATUSES_FETCH_REQUEST });

    return api(getState).get('/api/v1/bookmarks').then(async (response) => {
      const next = response.next();
      const statuses: APIEntity[] = await response.json();
      dispatch(importFetchedStatuses(statuses));
      dispatch({ type: BOOKMARKED_STATUSES_FETCH_SUCCESS, statuses, next });
    }).catch(error => {
      dispatch({ type: BOOKMARKED_STATUSES_FETCH_FAIL, error });
    });
  };

const expandBookmarkedStatuses = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    const list = getState().status_lists.bookmarks;
    const url = list?.next;

    if (!url || list.isLoading) return;

    dispatch({ type: BOOKMARKED_STATUSES_EXPAND_REQUEST });

    return api(getState).get(url).then(async (response) => {
      const next = response.next();
      const statuses: APIEntity[] = await response.json();
      dispatch(importFetchedStatuses(statuses));
      dispatch({ type: BOOKMARKED_STATUSES_EXPAND_SUCCESS, statuses, next });
    }).catch(error => {
      dispatch({ type: BOOKMARKED_STATUSES_EXPAND_FAIL, error });
    });
  };

/** Bookmark a status, optimistically. Resolves to whether it succeeded. */
const bookmark = (status: Pick<Status, 'id'>) =>
  async (dispatch: AppDispatch, getState: () => RootState): Promise<boolean> => {
    if (!isLoggedIn(getState)) return false;

    dispatch({ type: BOOKMARK_REQUEST, status });

    try {
      const response = await api(getState).post(`/api/v1/statuses/${status.id}/bookmark`);
      const data = await response.json();
      dispatch(importFetchedStatus(data));
      dispatch({ type: BOOKMARK_SUCCESS, status: data });
      return true;
    } catch (error) {
      dispatch({ type: BOOKMARK_FAIL, status, error });
      return false;
    }
  };

/** Remove a bookmark from a status, optimistically. Resolves to whether it succeeded. */
const unbookmark = (status: Pick<Status, 'id'>) =>
  async (dispatch: AppDispatch, getState: () => RootState): Promise<boolean> => {
    if (!isLoggedIn(getState)) return false;

    dispatch({ type: UNBOOKMARK_REQUEST, status });

    try {
      await api(getState).post(`/api/v1/statuses/${status.id}/unbookmark`);
      dispatch({ type: UNBOOKMARK_SUCCESS, status });
      return true;
    } catch (error) {
      dispatch({ type: UNBOOKMARK_FAIL, status, error });
      return false;
    }
  };

export {
  BOOKMARKED_STATUSES_FETCH_REQUEST,
  BOOKMARKED_STATUSES_FETCH_SUCCESS,
  BOOKMARKED_STATUSES_FETCH_FAIL,
  BOOKMARKED_STATUSES_EXPAND_REQUEST,
  BOOKMARKED_STATUSES_EXPAND_SUCCESS,
  BOOKMARKED_STATUSES_EXPAND_FAIL,
  BOOKMARK_REQUEST,
  BOOKMARK_SUCCESS,
  BOOKMARK_FAIL,
  UNBOOKMARK_REQUEST,
  UNBOOKMARK_SUCCESS,
  UNBOOKMARK_FAIL,
  fetchBookmarkedStatuses,
  expandBookmarkedStatuses,
  bookmark,
  unbookmark,
};
