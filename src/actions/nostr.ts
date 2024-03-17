import { nip19 } from 'nostr-tools';

import { type AppDispatch } from 'soapbox/store';

import { verifyCredentials } from './auth';

/** Log in with a Nostr pubkey. */
function logInNostr(pubkey: string) {
  return (dispatch: AppDispatch) => {
    const npub = nip19.npubEncode(pubkey);
    return dispatch(verifyCredentials(npub));
  };
}

/** Log in with a Nostr extension. */
function nostrExtensionLogIn() {
  return async (dispatch: AppDispatch) => {
    if (!window.nostr) {
      throw new Error('No Nostr signer available');
    }
    const pubkey = await window.nostr.getPublicKey();
    return dispatch(logInNostr(pubkey));
  };
}

export { logInNostr, nostrExtensionLogIn };