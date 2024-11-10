import { Record as ImmutableRecord } from 'immutable';

import { fetchInstance } from 'soapbox/actions/instance.ts';
import { NOSTR_PUBKEY_SET } from 'soapbox/actions/nostr.ts';
import { SW_UPDATING } from 'soapbox/actions/sw.ts';

import type { AnyAction } from 'redux';

const ReducerRecord = ImmutableRecord({
  /** Whether /api/v1/instance 404'd (and we should display the external auth form). */
  instance_fetch_failed: false,
  /** Whether the ServiceWorker is currently updating (and we should display a loading screen). */
  swUpdating: false,
  /** User's nostr pubkey. */
  pubkey: undefined as string | undefined,
});

export default function meta(state = ReducerRecord(), action: AnyAction) {
  switch (action.type) {
    case fetchInstance.rejected.type:
      if (action.payload.response?.status === 404) {
        return state.set('instance_fetch_failed', true);
      }
      return state;
    case SW_UPDATING:
      return state.set('swUpdating', action.isUpdating);
    case NOSTR_PUBKEY_SET:
      return state.set('pubkey', action.pubkey);
    default:
      return state;
  }
}
