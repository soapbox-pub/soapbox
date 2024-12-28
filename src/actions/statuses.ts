import { Status as StatusEntity } from 'soapbox/schemas/index.ts';
import { isLoggedIn } from 'soapbox/utils/auth.ts';
import { getFeatures } from 'soapbox/utils/features.ts';
import { shouldHaveCard } from 'soapbox/utils/status.ts';

import api from '../api/index.ts';

import { setComposeToStatus } from './compose-status.ts';
import { fetchGroupRelationships } from './groups.ts';
import { importFetchedStatus, importFetchedStatuses } from './importer/index.ts';
import { openModal } from './modals.ts';
import { deleteFromTimelines } from './timelines.ts';

import type { AppDispatch, RootState } from 'soapbox/store.ts';
import type { APIEntity, Status } from 'soapbox/types/entities.ts';

const STATUS_CREATE_REQUEST = 'STATUS_CREATE_REQUEST';
const STATUS_CREATE_SUCCESS = 'STATUS_CREATE_SUCCESS';
const STATUS_CREATE_FAIL    = 'STATUS_CREATE_FAIL';

const STATUS_FETCH_SOURCE_REQUEST = 'STATUS_FETCH_SOURCE_REQUEST';
const STATUS_FETCH_SOURCE_SUCCESS = 'STATUS_FETCH_SOURCE_SUCCESS';
const STATUS_FETCH_SOURCE_FAIL    = 'STATUS_FETCH_SOURCE_FAIL';

const STATUS_FETCH_REQUEST = 'STATUS_FETCH_REQUEST';
const STATUS_FETCH_SUCCESS = 'STATUS_FETCH_SUCCESS';
const STATUS_FETCH_FAIL    = 'STATUS_FETCH_FAIL';

const STATUS_DELETE_REQUEST = 'STATUS_DELETE_REQUEST';
const STATUS_DELETE_SUCCESS = 'STATUS_DELETE_SUCCESS';
const STATUS_DELETE_FAIL    = 'STATUS_DELETE_FAIL';

const CONTEXT_FETCH_REQUEST = 'CONTEXT_FETCH_REQUEST';
const CONTEXT_FETCH_SUCCESS = 'CONTEXT_FETCH_SUCCESS';
const CONTEXT_FETCH_FAIL    = 'CONTEXT_FETCH_FAIL';

const STATUS_MUTE_REQUEST = 'STATUS_MUTE_REQUEST';
const STATUS_MUTE_SUCCESS = 'STATUS_MUTE_SUCCESS';
const STATUS_MUTE_FAIL    = 'STATUS_MUTE_FAIL';

const STATUS_UNMUTE_REQUEST = 'STATUS_UNMUTE_REQUEST';
const STATUS_UNMUTE_SUCCESS = 'STATUS_UNMUTE_SUCCESS';
const STATUS_UNMUTE_FAIL    = 'STATUS_UNMUTE_FAIL';

const STATUS_REVEAL = 'STATUS_REVEAL';
const STATUS_HIDE   = 'STATUS_HIDE';

const STATUS_TRANSLATE_REQUEST = 'STATUS_TRANSLATE_REQUEST';
const STATUS_TRANSLATE_SUCCESS = 'STATUS_TRANSLATE_SUCCESS';
const STATUS_TRANSLATE_FAIL    = 'STATUS_TRANSLATE_FAIL';
const STATUS_TRANSLATE_UNDO    = 'STATUS_TRANSLATE_UNDO';

const STATUS_UNFILTER = 'STATUS_UNFILTER';

const statusExists = (getState: () => RootState, statusId: string) => {
  return (getState().statuses.get(statusId) || null) !== null;
};

const createStatus = (params: Record<string, any>, idempotencyKey: string, statusId: string | null) => {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: STATUS_CREATE_REQUEST, params, idempotencyKey, editing: !!statusId });

    const method = statusId === null ? 'POST' : 'PUT';
    const path = statusId === null ? '/api/v1/statuses' : `/api/v1/statuses/${statusId}`;
    const headers = { 'Idempotency-Key': idempotencyKey };

    return api(getState).request(method, path, params, { headers }).then(async (response) => {
      const status = await response.json();

      // The backend might still be processing the rich media attachment
      if (!status.card && shouldHaveCard(status)) {
        status.expectsCard = true;
      }

      dispatch(importFetchedStatus(status, idempotencyKey));
      dispatch({ type: STATUS_CREATE_SUCCESS, status, params, idempotencyKey, editing: !!statusId });

      // Poll the backend for the updated card
      if (status.expectsCard) {
        const delay = 1000;

        const poll = (retries = 5) => {
          api(getState).get(`/api/v1/statuses/${status.id}`).then((response) => response.json()).then((data) => {
            if (data?.card) {
              dispatch(importFetchedStatus(data));
            } else if (retries > 0 && response.status === 200) {
              setTimeout(() => poll(retries - 1), delay);
            }
          }).catch(console.error);
        };

        setTimeout(() => poll(), delay);
      }

      return status;
    }).catch(error => {
      dispatch({ type: STATUS_CREATE_FAIL, error, params, idempotencyKey, editing: !!statusId });
      throw error;
    });
  };
};

const editStatus = (id: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  let status = getState().statuses.get(id)!;

  if (status.poll) {
    status = status.set('poll', getState().polls.get(status.poll) as any);
  }

  dispatch({ type: STATUS_FETCH_SOURCE_REQUEST });

  api(getState).get(`/api/v1/statuses/${id}/source`).then((response) => response.json()).then((data) => {
    dispatch({ type: STATUS_FETCH_SOURCE_SUCCESS });
    dispatch(setComposeToStatus(status, data.text, data.spoiler_text, data.content_type, false));
    dispatch(openModal('COMPOSE'));
  }).catch(error => {
    dispatch({ type: STATUS_FETCH_SOURCE_FAIL, error });

  });
};

const fetchStatus = (id: string) => {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    const skipLoading = statusExists(getState, id);

    dispatch({ type: STATUS_FETCH_REQUEST, id, skipLoading });

    return api(getState).get(`/api/v1/statuses/${id}`).then((response) => response.json()).then((status) => {
      dispatch(importFetchedStatus(status));
      if (status.group) {
        dispatch(fetchGroupRelationships([status.group.id]));
      }
      dispatch({ type: STATUS_FETCH_SUCCESS, status, skipLoading });
      return status;
    }).catch(error => {
      dispatch({ type: STATUS_FETCH_FAIL, id, error, skipLoading, skipAlert: true });
    });
  };
};

const deleteStatus = (id: string, withRedraft = false) => {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return null;

    let status = getState().statuses.get(id)!;

    if (status.poll) {
      status = status.set('poll', getState().polls.get(status.poll) as any);
    }

    dispatch({ type: STATUS_DELETE_REQUEST, params: status });

    return api(getState)
      .delete(`/api/v1/statuses/${id}`)
      .then((response) => response.json()).then((data) => {
        dispatch({ type: STATUS_DELETE_SUCCESS, id });
        dispatch(deleteFromTimelines(id));

        if (withRedraft) {
          dispatch(setComposeToStatus(status, data.text, data.spoiler_text, data.pleroma?.content_type, withRedraft));
          dispatch(openModal('COMPOSE'));
        }
      })
      .catch(error => {
        dispatch({ type: STATUS_DELETE_FAIL, params: status, error });
      });
  };
};

const updateStatus = (status: APIEntity) => (dispatch: AppDispatch) =>
  dispatch(importFetchedStatus(status));

const fetchContext = (id: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: CONTEXT_FETCH_REQUEST, id });

    return api(getState).get(`/api/v1/statuses/${id}/context`).then((response) => response.json()).then((context) => {
      if (Array.isArray(context)) {
        // Mitra: returns a list of statuses
        dispatch(importFetchedStatuses(context));
      } else if (typeof context === 'object') {
        // Standard Mastodon API returns a map with `ancestors` and `descendants`
        const { ancestors, descendants } = context;
        const statuses = ancestors.concat(descendants);
        dispatch(importFetchedStatuses(statuses));
        dispatch({ type: CONTEXT_FETCH_SUCCESS, id, ancestors, descendants });
      } else {
        throw context;
      }
      return context;
    }).catch(error => {
      if (error.response?.status === 404) {
        dispatch(deleteFromTimelines(id));
      }

      dispatch({ type: CONTEXT_FETCH_FAIL, id, error, skipAlert: true });
    });
  };

const fetchNext = (statusId: string, next: string) =>
  async(dispatch: AppDispatch, getState: () => RootState) => {
    const response = await api(getState).get(next);
    const data = await response.json();

    dispatch(importFetchedStatuses(data));

    dispatch({
      type: CONTEXT_FETCH_SUCCESS,
      id: statusId,
      ancestors: [],
      descendants: data,
    });

    return { next: response.pagination().next };
  };

const fetchAncestors = (id: string) =>
  async(dispatch: AppDispatch, getState: () => RootState) => {
    const response = await api(getState).get(`/api/v1/statuses/${id}/context/ancestors`);
    const data = await response.json();
    dispatch(importFetchedStatuses(data));
    return response;
  };

const fetchDescendants = (id: string) =>
  async(dispatch: AppDispatch, getState: () => RootState) => {
    const response = await api(getState).get(`/api/v1/statuses/${id}/context/descendants`);
    const data = await response.json();
    dispatch(importFetchedStatuses(data));
    return response;
  };

const fetchStatusWithContext = (id: string) =>
  async(dispatch: AppDispatch, getState: () => RootState) => {
    const features = getFeatures(getState().instance);

    if (features.paginatedContext) {
      await dispatch(fetchStatus(id));

      const [ancestors, descendants] = await Promise.all([
        dispatch(fetchAncestors(id)),
        dispatch(fetchDescendants(id)),
      ]);

      dispatch({
        type: CONTEXT_FETCH_SUCCESS,
        id,
        ancestors: await ancestors.json(),
        descendants: await descendants.json(),
      });

      return descendants.pagination();
    } else {
      await Promise.all([
        dispatch(fetchContext(id)),
        dispatch(fetchStatus(id)),
      ]);
      return { next: null, prev: null };
    }
  };

const muteStatus = (id: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    dispatch({ type: STATUS_MUTE_REQUEST, id });
    api(getState).post(`/api/v1/statuses/${id}/mute`).then(() => {
      dispatch({ type: STATUS_MUTE_SUCCESS, id });
    }).catch(error => {
      dispatch({ type: STATUS_MUTE_FAIL, id, error });
    });
  };

const unmuteStatus = (id: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    dispatch({ type: STATUS_UNMUTE_REQUEST, id });
    api(getState).post(`/api/v1/statuses/${id}/unmute`).then(() => {
      dispatch({ type: STATUS_UNMUTE_SUCCESS, id });
    }).catch(error => {
      dispatch({ type: STATUS_UNMUTE_FAIL, id, error });
    });
  };

const toggleMuteStatus = (status: StatusEntity) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (status.muted) {
      dispatch(unmuteStatus(status.id));
    } else {
      dispatch(muteStatus(status.id));
    }
  };

const hideStatus = (ids: string[] | string) => {
  if (!Array.isArray(ids)) {
    ids = [ids];
  }

  return {
    type: STATUS_HIDE,
    ids,
  };
};

const revealStatus = (ids: string[] | string) => {
  if (!Array.isArray(ids)) {
    ids = [ids];
  }

  return {
    type: STATUS_REVEAL,
    ids,
  };
};

const toggleStatusHidden = (status: Status) => {
  if (status.hidden) {
    return revealStatus(status.id);
  } else {
    return hideStatus(status.id);
  }
};

const translateStatus = (id: string, lang?: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch({ type: STATUS_TRANSLATE_REQUEST, id });

  api(getState).post(`/api/v1/statuses/${id}/translate`, {
    lang, // Mastodon API
    target_language: lang, // HACK: Rebased and Pleroma compatibility
  }).then((response) => response.json()).then((data) => {
    dispatch({
      type: STATUS_TRANSLATE_SUCCESS,
      id,
      translation: data,
    });
  }).catch(error => {
    dispatch({
      type: STATUS_TRANSLATE_FAIL,
      id,
      error,
    });
  });
};

const undoStatusTranslation = (id: string) => ({
  type: STATUS_TRANSLATE_UNDO,
  id,
});

const unfilterStatus = (id: string) => ({
  type: STATUS_UNFILTER,
  id,
});

export {
  STATUS_CREATE_REQUEST,
  STATUS_CREATE_SUCCESS,
  STATUS_CREATE_FAIL,
  STATUS_FETCH_SOURCE_REQUEST,
  STATUS_FETCH_SOURCE_SUCCESS,
  STATUS_FETCH_SOURCE_FAIL,
  STATUS_FETCH_REQUEST,
  STATUS_FETCH_SUCCESS,
  STATUS_FETCH_FAIL,
  STATUS_DELETE_REQUEST,
  STATUS_DELETE_SUCCESS,
  STATUS_DELETE_FAIL,
  CONTEXT_FETCH_REQUEST,
  CONTEXT_FETCH_SUCCESS,
  CONTEXT_FETCH_FAIL,
  STATUS_MUTE_REQUEST,
  STATUS_MUTE_SUCCESS,
  STATUS_MUTE_FAIL,
  STATUS_UNMUTE_REQUEST,
  STATUS_UNMUTE_SUCCESS,
  STATUS_UNMUTE_FAIL,
  STATUS_REVEAL,
  STATUS_HIDE,
  STATUS_TRANSLATE_REQUEST,
  STATUS_TRANSLATE_SUCCESS,
  STATUS_TRANSLATE_FAIL,
  STATUS_TRANSLATE_UNDO,
  STATUS_UNFILTER,
  createStatus,
  editStatus,
  fetchStatus,
  deleteStatus,
  updateStatus,
  fetchContext,
  fetchNext,
  fetchAncestors,
  fetchDescendants,
  fetchStatusWithContext,
  muteStatus,
  unmuteStatus,
  toggleMuteStatus,
  hideStatus,
  revealStatus,
  toggleStatusHidden,
  translateStatus,
  undoStatusTranslation,
  unfilterStatus,
};
