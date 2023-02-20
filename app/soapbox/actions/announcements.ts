import api from 'soapbox/api';
import { getFeatures } from 'soapbox/utils/features';

import { importFetchedStatuses } from './importer';

import type { AxiosError } from 'axios';
import type { AppDispatch, RootState } from 'soapbox/store';
import type { APIEntity } from 'soapbox/types/entities';

const ANNOUNCEMENTS_FETCH_REQUEST = 'ANNOUNCEMENTS_FETCH_REQUEST';
const ANNOUNCEMENTS_FETCH_SUCCESS = 'ANNOUNCEMENTS_FETCH_SUCCESS';
const ANNOUNCEMENTS_FETCH_FAIL    = 'ANNOUNCEMENTS_FETCH_FAIL';
const ANNOUNCEMENTS_UPDATE        = 'ANNOUNCEMENTS_UPDATE';
const ANNOUNCEMENTS_DELETE        = 'ANNOUNCEMENTS_DELETE';

const ANNOUNCEMENTS_DISMISS_REQUEST = 'ANNOUNCEMENTS_DISMISS_REQUEST';
const ANNOUNCEMENTS_DISMISS_SUCCESS = 'ANNOUNCEMENTS_DISMISS_SUCCESS';
const ANNOUNCEMENTS_DISMISS_FAIL    = 'ANNOUNCEMENTS_DISMISS_FAIL';

const ANNOUNCEMENTS_REACTION_ADD_REQUEST = 'ANNOUNCEMENTS_REACTION_ADD_REQUEST';
const ANNOUNCEMENTS_REACTION_ADD_SUCCESS = 'ANNOUNCEMENTS_REACTION_ADD_SUCCESS';
const ANNOUNCEMENTS_REACTION_ADD_FAIL    = 'ANNOUNCEMENTS_REACTION_ADD_FAIL';

const ANNOUNCEMENTS_REACTION_REMOVE_REQUEST = 'ANNOUNCEMENTS_REACTION_REMOVE_REQUEST';
const ANNOUNCEMENTS_REACTION_REMOVE_SUCCESS = 'ANNOUNCEMENTS_REACTION_REMOVE_SUCCESS';
const ANNOUNCEMENTS_REACTION_REMOVE_FAIL    = 'ANNOUNCEMENTS_REACTION_REMOVE_FAIL';

const ANNOUNCEMENTS_REACTION_UPDATE = 'ANNOUNCEMENTS_REACTION_UPDATE';

const ANNOUNCEMENTS_TOGGLE_SHOW = 'ANNOUNCEMENTS_TOGGLE_SHOW';

const noOp = () => {};

const fetchAnnouncements = (done = noOp) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const { instance } = getState();
    const features = getFeatures(instance);

    if (!features.announcements) return null;

    dispatch(fetchAnnouncementsRequest());

    return api(getState).get('/api/v1/announcements').then(response => {
      dispatch(fetchAnnouncementsSuccess(response.data));
      dispatch(importFetchedStatuses(response.data.map(({ statuses }: APIEntity) => statuses)));
    }).catch(error => {
      dispatch(fetchAnnouncementsFail(error));
    }).finally(() => {
      done();
    });
  };

const fetchAnnouncementsRequest = () => ({
  type: ANNOUNCEMENTS_FETCH_REQUEST,
  skipLoading: true,
});

const fetchAnnouncementsSuccess = (announcements: APIEntity) => ({
  type: ANNOUNCEMENTS_FETCH_SUCCESS,
  announcements,
  skipLoading: true,
});

const fetchAnnouncementsFail = (error: AxiosError) => ({
  type: ANNOUNCEMENTS_FETCH_FAIL,
  error,
  skipLoading: true,
  skipAlert: true,
});

const updateAnnouncements = (announcement: APIEntity) => ({
  type: ANNOUNCEMENTS_UPDATE,
  announcement: announcement,
});

const dismissAnnouncement = (announcementId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(dismissAnnouncementRequest(announcementId));

    return api(getState).post(`/api/v1/announcements/${announcementId}/dismiss`).then(() => {
      dispatch(dismissAnnouncementSuccess(announcementId));
    }).catch(error => {
      dispatch(dismissAnnouncementFail(announcementId, error));
    });
  };

const dismissAnnouncementRequest = (announcementId: string) => ({
  type: ANNOUNCEMENTS_DISMISS_REQUEST,
  id: announcementId,
});

const dismissAnnouncementSuccess = (announcementId: string) => ({
  type: ANNOUNCEMENTS_DISMISS_SUCCESS,
  id: announcementId,
});

const dismissAnnouncementFail = (announcementId: string, error: AxiosError) => ({
  type: ANNOUNCEMENTS_DISMISS_FAIL,
  id: announcementId,
  error,
});

const addReaction = (announcementId: string, name: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const announcement = getState().announcements.items.find(x => x.get('id') === announcementId);

    let alreadyAdded = false;

    if (announcement) {
      const reaction = announcement.reactions.find(x => x.name === name);

      if (reaction && reaction.me) {
        alreadyAdded = true;
      }
    }

    if (!alreadyAdded) {
      dispatch(addReactionRequest(announcementId, name, alreadyAdded));
    }

    return api(getState).put(`/api/v1/announcements/${announcementId}/reactions/${name}`).then(() => {
      dispatch(addReactionSuccess(announcementId, name, alreadyAdded));
    }).catch(err => {
      if (!alreadyAdded) {
        dispatch(addReactionFail(announcementId, name, err));
      }
    });
  };

const addReactionRequest = (announcementId: string, name: string, alreadyAdded?: boolean) => ({
  type: ANNOUNCEMENTS_REACTION_ADD_REQUEST,
  id: announcementId,
  name,
  skipLoading: true,
});

const addReactionSuccess = (announcementId: string, name: string, alreadyAdded?: boolean) => ({
  type: ANNOUNCEMENTS_REACTION_ADD_SUCCESS,
  id: announcementId,
  name,
  skipLoading: true,
});

const addReactionFail = (announcementId: string, name: string, error: AxiosError) => ({
  type: ANNOUNCEMENTS_REACTION_ADD_FAIL,
  id: announcementId,
  name,
  error,
  skipLoading: true,
});

const removeReaction = (announcementId: string, name: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(removeReactionRequest(announcementId, name));

    return api(getState).delete(`/api/v1/announcements/${announcementId}/reactions/${name}`).then(() => {
      dispatch(removeReactionSuccess(announcementId, name));
    }).catch(err => {
      dispatch(removeReactionFail(announcementId, name, err));
    });
  };

const removeReactionRequest = (announcementId: string, name: string) => ({
  type: ANNOUNCEMENTS_REACTION_REMOVE_REQUEST,
  id: announcementId,
  name,
  skipLoading: true,
});

const removeReactionSuccess = (announcementId: string, name: string) => ({
  type: ANNOUNCEMENTS_REACTION_REMOVE_SUCCESS,
  id: announcementId,
  name,
  skipLoading: true,
});

const removeReactionFail = (announcementId: string, name: string, error: AxiosError) => ({
  type: ANNOUNCEMENTS_REACTION_REMOVE_FAIL,
  id: announcementId,
  name,
  error,
  skipLoading: true,
});

const updateReaction = (reaction: APIEntity) => ({
  type: ANNOUNCEMENTS_REACTION_UPDATE,
  reaction,
});

const toggleShowAnnouncements = () => ({
  type: ANNOUNCEMENTS_TOGGLE_SHOW,
});

const deleteAnnouncement = (id: string) => ({
  type: ANNOUNCEMENTS_DELETE,
  id,
});

export {
  ANNOUNCEMENTS_FETCH_REQUEST,
  ANNOUNCEMENTS_FETCH_SUCCESS,
  ANNOUNCEMENTS_FETCH_FAIL,
  ANNOUNCEMENTS_UPDATE,
  ANNOUNCEMENTS_DELETE,
  ANNOUNCEMENTS_DISMISS_REQUEST,
  ANNOUNCEMENTS_DISMISS_SUCCESS,
  ANNOUNCEMENTS_DISMISS_FAIL,
  ANNOUNCEMENTS_REACTION_ADD_REQUEST,
  ANNOUNCEMENTS_REACTION_ADD_SUCCESS,
  ANNOUNCEMENTS_REACTION_ADD_FAIL,
  ANNOUNCEMENTS_REACTION_REMOVE_REQUEST,
  ANNOUNCEMENTS_REACTION_REMOVE_SUCCESS,
  ANNOUNCEMENTS_REACTION_REMOVE_FAIL,
  ANNOUNCEMENTS_REACTION_UPDATE,
  ANNOUNCEMENTS_TOGGLE_SHOW,
  fetchAnnouncements,
  fetchAnnouncementsRequest,
  fetchAnnouncementsSuccess,
  fetchAnnouncementsFail,
  updateAnnouncements,
  dismissAnnouncement,
  dismissAnnouncementRequest,
  dismissAnnouncementSuccess,
  dismissAnnouncementFail,
  addReaction,
  addReactionRequest,
  addReactionSuccess,
  addReactionFail,
  removeReaction,
  removeReactionRequest,
  removeReactionSuccess,
  removeReactionFail,
  updateReaction,
  toggleShowAnnouncements,
  deleteAnnouncement,
};
