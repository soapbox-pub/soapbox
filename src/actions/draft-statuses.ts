import { v4 as uuid } from 'uuid';

import { makeGetAccount } from 'soapbox/selectors';
import KVStore from 'soapbox/storage/kv-store';

import type { AppDispatch, RootState } from 'soapbox/store';

const DRAFT_STATUSES_FETCH_SUCCESS = 'DRAFT_STATUSES_FETCH_SUCCESS';

const PERSIST_DRAFT_STATUS = 'PERSIST_DRAFT_STATUS';
const CANCEL_DRAFT_STATUS  = 'DELETE_DRAFT_STATUS';

const getAccount = makeGetAccount();

const fetchDraftStatuses = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const accountUrl = getAccount(state, state.me as string)!.url;

    return KVStore.getItem(`drafts:${accountUrl}`).then((statuses) => {
      dispatch({
        type: DRAFT_STATUSES_FETCH_SUCCESS,
        statuses,
      });
    }).catch(() => {});
  };

const saveDraftStatus = (composeId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const accountUrl = getAccount(state, state.me as string)!.url;

    const compose = state.compose.get(composeId)!;

    const draft = {
      ...compose.toJS(),
      draft_id: compose.draft_id || uuid(),
    };

    dispatch({
      type: PERSIST_DRAFT_STATUS,
      status: draft,
      accountUrl,
    });
  };

const cancelDraftStatus = (id: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const accountUrl = getAccount(state, state.me as string)!.url;

    dispatch({
      type: CANCEL_DRAFT_STATUS,
      id,
      accountUrl,
    });
  };

export {
  DRAFT_STATUSES_FETCH_SUCCESS,
  PERSIST_DRAFT_STATUS,
  CANCEL_DRAFT_STATUS,
  fetchDraftStatuses,
  saveDraftStatus,
  cancelDraftStatus,
};
