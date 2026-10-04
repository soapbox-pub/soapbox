import { fetchInstance } from '@/actions/instance.ts';
import { SW_UPDATING } from '@/actions/sw.ts';

import type { AnyAction } from 'redux';

interface State {
  /** Whether /api/v1/instance 404'd (and we should display the external auth form). */
  instance_fetch_failed: boolean;
  /** Whether the ServiceWorker is currently updating (and we should display a loading screen). */
  swUpdating: boolean;
}

const initialState: State = {
  instance_fetch_failed: false,
  swUpdating: false,
};

export default function meta(state: State = initialState, action: AnyAction): State {
  switch (action.type) {
    case fetchInstance.rejected.type:
      if (action.payload.response?.status === 404) {
        return { ...state, instance_fetch_failed: true };
      }
      return state;
    case SW_UPDATING:
      return { ...state, swUpdating: action.isUpdating };
    default:
      return state;
  }
}
