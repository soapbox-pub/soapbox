import { v4 as uuid } from 'uuid';

import KVStore from 'soapbox/storage/kv-store';

import type { AppDispatch, RootState } from 'soapbox/store';

const DRAFT_STATUSES_FETCH_SUCCESS = 'DRAFT_STATUSES_FETCH_SUCCESS';

const PERSIST_DRAFT_STATUS = 'PERSIST_DRAFT_STATUS';
const CANCEL_DRAFT_STATUS  = 'DELETE_DRAFT_STATUS';

const fetchDraftStatuses = () =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    KVStore.getItem(`drafts:${getState().me}`).then((statuses) => {
      dispatch({
        type: DRAFT_STATUSES_FETCH_SUCCESS,
        statuses,
      });
    }).catch(() => {});

const saveDraftStatus = (composeId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();

    const compose = state.compose.get(composeId)!;

    const draft = {
      ...compose.toJS(),
      draft_id: compose.draft_id || uuid(),
    };

    dispatch({
      type: PERSIST_DRAFT_STATUS,
      status: draft,
      accountId: state.me,
    });
  };

const cancelDraftStatus = (id: string) =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    dispatch({
      type: CANCEL_DRAFT_STATUS,
      id,
      accountId: getState().me,
    });

export {
  DRAFT_STATUSES_FETCH_SUCCESS,
  PERSIST_DRAFT_STATUS,
  CANCEL_DRAFT_STATUS,
  fetchDraftStatuses,
  saveDraftStatus,
  cancelDraftStatus,
};
