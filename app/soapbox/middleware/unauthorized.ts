import type { AnyAction } from 'redux';
import type { ThunkMiddleware } from 'redux-thunk';

const isSkipped = (action: AnyAction): boolean => !!action.skipUnauthorized;
const isUnauthorized = (action: AnyAction): boolean => action.error?.response?.status === 401;

/** Redirect to login if the API returns a 401. */
export default function unauthorizedMiddleware(): ThunkMiddleware {
  return () => next => action => {
    if (isUnauthorized(action) && !isSkipped(action)) {
      window.location.href = '/login';
      return undefined;
    } else {
      return next(action);
    }
  };
}
