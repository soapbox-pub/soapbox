import { NostrSigner, NRelay1, NSecSigner } from '@nostrify/nostrify';
import { generateSecretKey } from 'nostr-tools';

import { NostrRPC } from 'soapbox/features/nostr/NostrRPC';
import { useBunkerStore } from 'soapbox/hooks/useBunkerStore';
import { type AppDispatch } from 'soapbox/store';

import { authLoggedIn, verifyCredentials } from './auth';
import { obtainOAuthToken } from './oauth';

const NOSTR_PUBKEY_SET = 'NOSTR_PUBKEY_SET';

/** Log in with a Nostr pubkey. */
function logInNostr(signer: NostrSigner, relay: NRelay1, signal: AbortSignal) {
  return async (dispatch: AppDispatch) => {
    const authorization = generateBunkerAuth();

    const pubkey = await signer.getPublicKey();
    const bunkerPubkey = await authorization.signer.getPublicKey();

    const rpc = new NostrRPC(relay, authorization.signer);
    const sub = rpc.req([{ kinds: [24133], '#p': [bunkerPubkey], limit: 0 }], { signal: AbortSignal.timeout(1_000) });

    const tokenPromise = dispatch(obtainOAuthToken({
      grant_type: 'nostr_bunker',
      pubkey: bunkerPubkey,
      relays: [relay.socket.url],
      secret: authorization.secret,
    }));

    let authorizedPubkey: string | undefined;

    for await (const { request, respond, requestEvent } of sub) {
      if (request.method === 'connect') {
        const [, secret] = request.params;

        if (secret === authorization.secret) {
          authorizedPubkey = requestEvent.pubkey;
          await respond({ result: 'ack' });
        } else {
          await respond({ result: '', error: 'Invalid secret' });
          throw new Error('Invalid secret');
        }
      }
      if (request.method === 'get_public_key') {
        await respond({ result: pubkey });
        break;
      }
    }

    if (!authorizedPubkey) {
      throw new Error('Authorization failed');
    }

    const accessToken = dispatch(authLoggedIn(await tokenPromise)).access_token as string;
    const bunkerState = useBunkerStore.getState();

    bunkerState.connect({
      pubkey,
      accessToken,
      authorizedPubkey,
      bunkerSeckey: authorization.seckey,
    });

    await dispatch(verifyCredentials(accessToken));
  };
}

/** Log in with a Nostr extension. */
function nostrExtensionLogIn(relay: NRelay1, signal: AbortSignal) {
  return async (dispatch: AppDispatch) => {
    if (!window.nostr) {
      throw new Error('No Nostr signer available');
    }
    return dispatch(logInNostr(window.nostr, relay, signal));
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
