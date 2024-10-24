import { RootState, type AppDispatch } from 'soapbox/store';

import { authLoggedIn, verifyCredentials } from './auth';
import { obtainOAuthToken } from './oauth';

const NOSTR_PUBKEY_SET = 'NOSTR_PUBKEY_SET';

/** Log in with a Nostr pubkey. */
function logInNostr(pubkey: string) {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(setNostrPubkey(pubkey));

    const secret = sessionStorage.getItem('soapbox:nip46:secret');
    if (!secret) {
      throw new Error('No secret found in session storage');
    }

    const relay = getState().instance.nostr?.relay;

    // HACK: waits 1 second to ensure the relay subscription is open
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const token = await dispatch(obtainOAuthToken({
      grant_type: 'nostr_bunker',
      pubkey,
      relays: relay ? [relay] : undefined,
      secret,
    }));

    const { access_token } = dispatch(authLoggedIn(token));
    await dispatch(verifyCredentials(access_token as string));

    dispatch(setNostrPubkey(undefined));
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

function setNostrPubkey(pubkey: string | undefined) {
  return {
    type: NOSTR_PUBKEY_SET,
    pubkey,
  };
}

export { logInNostr, nostrExtensionLogIn, setNostrPubkey, NOSTR_PUBKEY_SET };
