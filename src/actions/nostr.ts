import { nip19 } from 'nostr-tools';

import { type AppDispatch } from 'soapbox/store';

import { verifyCredentials } from './auth';
import { closeModal } from './modals';

/** Log in with a Nostr extension. */
function nostrExtensionLogIn() {
  return async (dispatch: AppDispatch) => {
    if (!window.nostr) {
      throw new Error('No Nostr signer available');
    }

    const pubkey = await window.nostr.getPublicKey();
    const npub = nip19.npubEncode(pubkey);

    dispatch(closeModal('NOSTR_SIGNIN'));
    return dispatch(verifyCredentials(npub));
  };
}

export { nostrExtensionLogIn };