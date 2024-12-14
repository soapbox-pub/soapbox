import api from '../api/index.ts';

import { importFetchedPoll } from './importer/index.ts';

import type { AppDispatch, RootState } from 'soapbox/store.ts';
import type { APIEntity } from 'soapbox/types/entities.ts';

const POLL_VOTE_REQUEST = 'POLL_VOTE_REQUEST';
const POLL_VOTE_SUCCESS = 'POLL_VOTE_SUCCESS';
const POLL_VOTE_FAIL    = 'POLL_VOTE_FAIL';

const POLL_FETCH_REQUEST = 'POLL_FETCH_REQUEST';
const POLL_FETCH_SUCCESS = 'POLL_FETCH_SUCCESS';
const POLL_FETCH_FAIL    = 'POLL_FETCH_FAIL';

const vote = (pollId: string, choices: string[]) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(voteRequest());

    api(getState).post(`/api/v1/polls/${pollId}/votes`, { choices })
      .then((response) => response.json()).then((data) => {
        dispatch(importFetchedPoll(data));
        dispatch(voteSuccess(data));
      })
      .catch(err => dispatch(voteFail(err)));
  };

const fetchPoll = (pollId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(fetchPollRequest());

    api(getState).get(`/api/v1/polls/${pollId}`)
      .then((response) => response.json()).then((data) => {
        dispatch(importFetchedPoll(data));
        dispatch(fetchPollSuccess(data));
      })
      .catch(err => dispatch(fetchPollFail(err)));
  };

const voteRequest = () => ({
  type: POLL_VOTE_REQUEST,
});

const voteSuccess = (poll: APIEntity) => ({
  type: POLL_VOTE_SUCCESS,
  poll,
});

const voteFail = (error: unknown) => ({
  type: POLL_VOTE_FAIL,
  error,
});

const fetchPollRequest = () => ({
  type: POLL_FETCH_REQUEST,
});

const fetchPollSuccess = (poll: APIEntity) => ({
  type: POLL_FETCH_SUCCESS,
  poll,
});

const fetchPollFail = (error: unknown) => ({
  type: POLL_FETCH_FAIL,
  error,
});

export {
  POLL_VOTE_REQUEST,
  POLL_VOTE_SUCCESS,
  POLL_VOTE_FAIL,
  POLL_FETCH_REQUEST,
  POLL_FETCH_SUCCESS,
  POLL_FETCH_FAIL,
  vote,
  fetchPoll,
  voteRequest,
  voteSuccess,
  voteFail,
  fetchPollRequest,
  fetchPollSuccess,
  fetchPollFail,
};
