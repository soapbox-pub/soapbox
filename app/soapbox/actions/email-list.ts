import api from '../api';

import type { AppDispatch, RootState } from 'soapbox/store';

const getSubscribersCsv = () =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    api(getState).get('/api/v1/pleroma/admin/email_list/subscribers.csv');

const getUnsubscribersCsv = () =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    api(getState).get('/api/v1/pleroma/admin/email_list/unsubscribers.csv');

const getCombinedCsv = () =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    api(getState).get('/api/v1/pleroma/admin/email_list/combined.csv');

export {
  getSubscribersCsv,
  getUnsubscribersCsv,
  getCombinedCsv,
};
