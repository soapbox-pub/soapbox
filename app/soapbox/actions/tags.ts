import api, { getLinks } from '../api';

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

const FOLLOWED_HASHTAGS_FETCH_REQUEST = 'FOLLOWED_HASHTAGS_FETCH_REQUEST';
const FOLLOWED_HASHTAGS_FETCH_SUCCESS = 'FOLLOWED_HASHTAGS_FETCH_SUCCESS';
const FOLLOWED_HASHTAGS_FETCH_FAIL    = 'FOLLOWED_HASHTAGS_FETCH_FAIL';

const FOLLOWED_HASHTAGS_EXPAND_REQUEST = 'FOLLOWED_HASHTAGS_EXPAND_REQUEST';
const FOLLOWED_HASHTAGS_EXPAND_SUCCESS = 'FOLLOWED_HASHTAGS_EXPAND_SUCCESS';
const FOLLOWED_HASHTAGS_EXPAND_FAIL    = 'FOLLOWED_HASHTAGS_EXPAND_FAIL';

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

const fetchFollowedHashtags = () => (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(fetchFollowedHashtagsRequest());

  api(getState).get('/api/v1/followed_tags').then(response => {
    const next = getLinks(response).refs.find(link => link.rel === 'next');
    dispatch(fetchFollowedHashtagsSuccess(response.data, next ? next.uri : null));
  }).catch(err => {
    dispatch(fetchFollowedHashtagsFail(err));
  });
};

const fetchFollowedHashtagsRequest = () => ({
  type: FOLLOWED_HASHTAGS_FETCH_REQUEST,
});

const fetchFollowedHashtagsSuccess = (followed_tags: APIEntity[], next: string | null) => ({
  type: FOLLOWED_HASHTAGS_FETCH_SUCCESS,
  followed_tags,
  next,
});

const fetchFollowedHashtagsFail = (error: AxiosError) => ({
  type: FOLLOWED_HASHTAGS_FETCH_FAIL,
  error,
});

const expandFollowedHashtags = () => (dispatch: AppDispatch, getState: () => RootState) => {
  const url = getState().followed_tags.next;

  if (url === null) {
    return;
  }

  dispatch(expandFollowedHashtagsRequest());

  api(getState).get(url).then(response => {
    const next = getLinks(response).refs.find(link => link.rel === 'next');
    dispatch(expandFollowedHashtagsSuccess(response.data, next ? next.uri : null));
  }).catch(error => {
    dispatch(expandFollowedHashtagsFail(error));
  });
};

const expandFollowedHashtagsRequest = () => ({
  type: FOLLOWED_HASHTAGS_EXPAND_REQUEST,
});

const expandFollowedHashtagsSuccess = (followed_tags: APIEntity[], next: string | null) => ({
  type: FOLLOWED_HASHTAGS_EXPAND_SUCCESS,
  followed_tags,
  next,
});

const expandFollowedHashtagsFail = (error: AxiosError) => ({
  type: FOLLOWED_HASHTAGS_EXPAND_FAIL,
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
  FOLLOWED_HASHTAGS_FETCH_REQUEST,
  FOLLOWED_HASHTAGS_FETCH_SUCCESS,
  FOLLOWED_HASHTAGS_FETCH_FAIL,
  FOLLOWED_HASHTAGS_EXPAND_REQUEST,
  FOLLOWED_HASHTAGS_EXPAND_SUCCESS,
  FOLLOWED_HASHTAGS_EXPAND_FAIL,
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
  fetchFollowedHashtags,
  fetchFollowedHashtagsRequest,
  fetchFollowedHashtagsSuccess,
  fetchFollowedHashtagsFail,
  expandFollowedHashtags,
  expandFollowedHashtagsRequest,
  expandFollowedHashtagsSuccess,
  expandFollowedHashtagsFail,
};
