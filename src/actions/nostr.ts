import { nip19 } from 'nostr-tools';

import { signer } from 'soapbox/features/nostr/sign';
import { type AppDispatch } from 'soapbox/store';

import { verifyCredentials } from './auth';

/** Log in with a Nostr pubkey. */
function nostrLogIn() {
  return async (dispatch: AppDispatch) => {
    const pubkey = await signer.getPublicKey();
    const npub = nip19.npubEncode(pubkey);

    return dispatch(verifyCredentials(npub));
  };
}

export { nostrLogIn };