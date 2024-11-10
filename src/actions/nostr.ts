import { NostrSigner, NRelay1, NSecSigner } from '@nostrify/nostrify';
import { generateSecretKey } from 'nostr-tools';

import { NBunker } from 'soapbox/features/nostr/NBunker.ts';
import { keyring } from 'soapbox/features/nostr/keyring.ts';
import { useBunkerStore } from 'soapbox/hooks/nostr/useBunkerStore.ts';
import { type AppDispatch } from 'soapbox/store.ts';

import { authLoggedIn, verifyCredentials } from './auth.ts';
import { obtainOAuthToken } from './oauth.ts';

const NOSTR_PUBKEY_SET = 'NOSTR_PUBKEY_SET';

/** Log in with a Nostr pubkey. */
function logInNostr(signer: NostrSigner, relay: NRelay1) {
  return async (dispatch: AppDispatch) => {
    const authorization = generateBunkerAuth();

    const pubkey = await signer.getPublicKey();
    const bunkerPubkey = await authorization.signer.getPublicKey();

    let authorizedPubkey: string | undefined;

    const bunker = new NBunker({
      relay,
      userSigner: signer,
      bunkerSigner: authorization.signer,
      onConnect(request, event) {
        const [, secret] = request.params;

        if (secret === authorization.secret) {
          bunker.authorize(event.pubkey);
          authorizedPubkey = event.pubkey;
          return { id: request.id, result: 'ack' };
        } else {
          return { id: request.id, result: '', error: 'Invalid secret' };
        }
      },
    });

    await bunker.waitReady;

    const token = await dispatch(obtainOAuthToken({
      grant_type: 'nostr_bunker',
      pubkey: bunkerPubkey,
      relays: [relay.socket.url],
      secret: authorization.secret,
    }));

    if (!authorizedPubkey) {
      throw new Error('Authorization failed');
    }

    const accessToken = dispatch(authLoggedIn(token)).access_token as string;
    const bunkerState = useBunkerStore.getState();

    keyring.add(authorization.seckey);

    bunkerState.connect({
      pubkey,
      accessToken,
      authorizedPubkey,
      bunkerPubkey,
    });

    await dispatch(verifyCredentials(accessToken));
    bunker.close();
  };
}

/** Log in with a Nostr extension. */
function nostrExtensionLogIn(relay: NRelay1) {
  return async (dispatch: AppDispatch) => {
    if (!window.nostr) {
      throw new Error('No Nostr signer available');
    }
    return dispatch(logInNostr(window.nostr, relay));
  };
}

/** Generate a bunker authorization object. */
function generateBunkerAuth() {
  const secret = crypto.randomUUID();
  const seckey = generateSecretKey();

  return {
    secret,
    seckey,
    signer: new NSecSigner(seckey),
  };
}

function setNostrPubkey(pubkey: string | undefined) {
  return {
    type: NOSTR_PUBKEY_SET,
    pubkey,
  };
}

export { logInNostr, nostrExtensionLogIn, setNostrPubkey, NOSTR_PUBKEY_SET };
