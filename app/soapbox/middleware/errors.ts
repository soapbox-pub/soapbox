import toast from 'soapbox/toast';

import type { AnyAction } from 'redux';
import type { ThunkMiddleware } from 'redux-thunk';

/** Whether the action is considered a failure. */
const isFailType = (type: string): boolean => type.endsWith('_FAIL');

/** Whether the action is a failure to fetch from browser storage. */
const isRememberFailType = (type: string): boolean => type.endsWith('_REMEMBER_FAIL');

/** Whether the error contains an Axios response. */
const hasResponse = (error: any): boolean => Boolean(error && error.response);

/** Don't show 401's. */
const authorized = (error: any): boolean => error?.response?.status !== 401;

/** Whether the error should be shown to the user. */
const shouldShowError = ({ type, skipAlert, error }: AnyAction): boolean => {
  return !skipAlert && hasResponse(error) && authorized(error) && isFailType(type) && !isRememberFailType(type);
};

/** Middleware to display Redux errors to the user. */
const errorsMiddleware = (): ThunkMiddleware =>
  () => next => action => {
    if (shouldShowError(action)) {
      toast.showAlertForError(action.error);
    }

    return next(action);
  };

export default errorsMiddleware;
