import api from '../api/index.ts';

import type { AnyAction } from 'redux';
import type { RootState } from 'soapbox/store.ts';

const ACCOUNT_NOTE_SUBMIT_REQUEST = 'ACCOUNT_NOTE_SUBMIT_REQUEST';
const ACCOUNT_NOTE_SUBMIT_SUCCESS = 'ACCOUNT_NOTE_SUBMIT_SUCCESS';
const ACCOUNT_NOTE_SUBMIT_FAIL = 'ACCOUNT_NOTE_SUBMIT_FAIL';

const submitAccountNote = (id: string, value: string) =>
  (dispatch: React.Dispatch<AnyAction>, getState: () => RootState) => {
    dispatch(submitAccountNoteRequest());

    return api(getState)
      .post(`/api/v1/accounts/${id}/note`, {
        comment: value,
      })
      .then(response => {
        dispatch(submitAccountNoteSuccess(response.data));
      })
      .catch(error => dispatch(submitAccountNoteFail(error)));
  };

const submitAccountNoteRequest = () => ({
  type: ACCOUNT_NOTE_SUBMIT_REQUEST,
});

const submitAccountNoteSuccess = (relationship: any) => ({
  type: ACCOUNT_NOTE_SUBMIT_SUCCESS,
  relationship,
});

const submitAccountNoteFail = (error: unknown) => ({
  type: ACCOUNT_NOTE_SUBMIT_FAIL,
  error,
});

export {
  submitAccountNote,
  ACCOUNT_NOTE_SUBMIT_REQUEST,
  ACCOUNT_NOTE_SUBMIT_SUCCESS,
  ACCOUNT_NOTE_SUBMIT_FAIL,
};
