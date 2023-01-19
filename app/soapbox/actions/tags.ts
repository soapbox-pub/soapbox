import api from '../api';

import type { AxiosError } from 'axios';
import type { AppDispatch, RootState } from 'soapbox/store';
import type { APIEntity } from 'soapbox/types/entities';

const HASHTAG_FETCH_REQUEST = 'HASHTAG_FETCH_REQUEST';
const HASHTAG_FETCH_SUCCESS = 'HASHTAG_FETCH_SUCCESS';
const HASHTAG_FETCH_FAIL    = 'HASHTAG_FETCH_FAIL';

const HASHTAG_FOLLOW_REQUEST = 'HASHTAG_FOLLOW_REQUEST';
const HASHTAG_FOLLOW_SUCCESS = 'HASHTAG_FOLLOW_SUCCESS';
const HASHTAG_FOLLOW_FAIL    = 'HASHTAG_FOLLOW_FAIL';

const HASHTAG_UNFOLLOW_REQUEST = 'HASHTAG_UNFOLLOW_REQUEST';
const HASHTAG_UNFOLLOW_SUCCESS = 'HASHTAG_UNFOLLOW_SUCCESS';
const HASHTAG_UNFOLLOW_FAIL    = 'HASHTAG_UNFOLLOW_FAIL';

const fetchHashtag = (name: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(fetchHashtagRequest());

  api(getState).get(`/api/v1/tags/${name}`).then(({ data }) => {
    dispatch(fetchHashtagSuccess(name, data));
  }).catch(err => {
    dispatch(fetchHashtagFail(err));
  });
};

const fetchHashtagRequest = () => ({
  type: HASHTAG_FETCH_REQUEST,
});

const fetchHashtagSuccess = (name: string, tag: APIEntity) => ({
  type: HASHTAG_FETCH_SUCCESS,
  name,
  tag,
});

const fetchHashtagFail = (error: AxiosError) => ({
  type: HASHTAG_FETCH_FAIL,
  error,
});

const followHashtag = (name: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(followHashtagRequest(name));

  api(getState).post(`/api/v1/tags/${name}/follow`).then(({ data }) => {
    dispatch(followHashtagSuccess(name, data));
  }).catch(err => {
    dispatch(followHashtagFail(name, err));
  });
};

const followHashtagRequest = (name: string) => ({
  type: HASHTAG_FOLLOW_REQUEST,
  name,
});

const followHashtagSuccess = (name: string, tag: APIEntity) => ({
  type: HASHTAG_FOLLOW_SUCCESS,
  name,
  tag,
});

const followHashtagFail = (name: string, error: AxiosError) => ({
  type: HASHTAG_FOLLOW_FAIL,
  name,
  error,
});

const unfollowHashtag = (name: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(unfollowHashtagRequest(name));

  api(getState).post(`/api/v1/tags/${name}/unfollow`).then(({ data }) => {
    dispatch(unfollowHashtagSuccess(name, data));
  }).catch(err => {
    dispatch(unfollowHashtagFail(name, err));
  });
};

const unfollowHashtagRequest = (name: string) => ({
  type: HASHTAG_UNFOLLOW_REQUEST,
  name,
});

const unfollowHashtagSuccess = (name: string, tag: APIEntity) => ({
  type: HASHTAG_UNFOLLOW_SUCCESS,
  name,
  tag,
});

const unfollowHashtagFail = (name: string, error: AxiosError) => ({
  type: HASHTAG_UNFOLLOW_FAIL,
  name,
  error,
});

export {
  HASHTAG_FETCH_REQUEST,
  HASHTAG_FETCH_SUCCESS,
  HASHTAG_FETCH_FAIL,
  HASHTAG_FOLLOW_REQUEST,
  HASHTAG_FOLLOW_SUCCESS,
  HASHTAG_FOLLOW_FAIL,
  HASHTAG_UNFOLLOW_REQUEST,
  HASHTAG_UNFOLLOW_SUCCESS,
  HASHTAG_UNFOLLOW_FAIL,
  fetchHashtag,
  fetchHashtagRequest,
  fetchHashtagSuccess,
  fetchHashtagFail,
  followHashtag,
  followHashtagRequest,
  followHashtagSuccess,
  followHashtagFail,
  unfollowHashtag,
  unfollowHashtagRequest,
  unfollowHashtagSuccess,
  unfollowHashtagFail,
};
