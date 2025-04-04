import { HTTPError } from 'soapbox/api/HTTPError.ts';
import toast from 'soapbox/toast.tsx';

import type { AnyAction, Middleware } from 'redux';

/** Whether the action is considered a failure. */
const isFailType = (type: string): boolean => type.endsWith('_FAIL');

/** Whether the action is a failure to fetch from browser storage. */
const isRememberFailType = (type: string): boolean => type.endsWith('_REMEMBER_FAIL');

/** Whether the error contains an Axios response. */
const hasResponse = (error: unknown): boolean => error instanceof HTTPError;

/** Don't show 401's. */
const authorized = (error: unknown): boolean => error instanceof HTTPError && error.response.status !== 401;

/** Whether the error should be shown to the user. */
const shouldShowError = ({ type, skipAlert, error }: AnyAction): boolean => {
  return !skipAlert && hasResponse(error) && authorized(error) && isFailType(type) && !isRememberFailType(type);
};

/** Middleware to display Redux errors to the user. */
const errorsMiddleware = (): Middleware =>
  () => next => anyAction => {
    const action = anyAction as AnyAction;
    if (shouldShowError(action)) {
      toast.showAlertForError(action.error);
    }

    return next(action);
  };

export default errorsMiddleware;
