import {
  NRelay,
  NostrConnectRequest,
  NostrConnectResponse,
  NostrEvent,
  NostrFilter,
  NostrSigner,
  NSchema as n,
} from '@nostrify/nostrify';

/** Options passed to `NBunker`. */
export interface NBunkerOpts {
  /** Relay to subscribe to for NIP-46 requests. */
  relay: NRelay;
  /** Signer to complete the actual NIP-46 requests, such as `get_public_key`, `sign_event`, `nip44_encrypt` etc. */
  userSigner: NostrSigner;
  /** Signer to sign, encrypt, and decrypt the kind 24133 transport events events. */
  bunkerSigner: NostrSigner;
  /**
   * Callback when a `connect` request has been received.
   * This is a good place to call `bunker.authorize()` with the remote client's pubkey.
   * It's up to the caller to verify the request parameters and secret, and then return a response object.
   * All other methods are handled by the bunker automatically.
   *
   * ```ts
   * const bunker = new Bunker({
   *   ...opts,
   *   onConnect(request, event) {
   *     const [, secret] = request.params;
   *
   *     if (secret === authorization.secret) {
   *       bunker.authorize(event.pubkey); // Authorize the pubkey for signer actions.
   *       return { id: request.id, result: 'ack' }; // Return a success response.
   *     } else {
   *       return { id: request.id, result: '', error: 'Invalid secret' };
   *     }
   *   },
   * });
   * ```
   */
  onConnect?(request: NostrConnectRequest, event: NostrEvent): Promise<NostrConnectResponse> | NostrConnectResponse;
  /**
   * Callback when an error occurs while parsing a request event.
   * Client errors are not captured here, only errors that occur before arequest's `id` can be known,
   * eg when decrypting the event content or parsing the request object.
   */
  onError?(error: unknown, event: NostrEvent): void;
}

/**
 * Modular NIP-46 remote signer bunker class.
 *
 * Runs a remote signer against a given relay, using `bunkerSigner` to sign transport events,
 * and `userSigner` to complete NIP-46 requests.
 */
export class NBunker {

  private controller = new AbortController();
  private authorizedPubkeys = new Set<string>();

  /** Wait for the bunker to be ready before sending requests. */
  public waitReady: Promise<void>;
  private setReady!: () => void;

  constructor(private opts: NBunkerOpts) {
    this.waitReady = new Promise((resolve) => {
      this.setReady = resolve;
    });
    this.open();
  }

  /** Open the signer subscription to the relay. */
  private async open() {
    const { relay, bunkerSigner, onError } = this.opts;

    const signal = this.controller.signal;
    const bunkerPubkey = await bunkerSigner.getPublicKey();

    const filters: NostrFilter[] = [
      { kinds: [24133], '#p': [bunkerPubkey], limit: 0 },
    ];

    const sub = relay.req(filters, { signal });
    this.setReady();

    for await (const msg of sub) {
      if (msg[0] === 'EVENT') {
        const [,, event] = msg;

        try {
          const decrypted = await this.decrypt(event.pubkey, event.content);
          const request = n.json().pipe(n.connectRequest()).parse(decrypted);
          await this.handleRequest(request, event);
        } catch (error) {
          onError?.(error, event);
        }
      }
    }
  }

  /**
   * Handle NIP-46 requests.
   *
   * The `connect` method must be handled passing an `onConnect` option into the class
   * and then calling `bunker.authorize()` within that callback to authorize the pubkey.
   *
   * All other methods are handled automatically, as long as the key is authorized,
   * by invoking the appropriate method on the `userSigner`.
   */
  private async handleRequest(request: NostrConnectRequest, event: NostrEvent): Promise<void> {
    const { userSigner, onConnect } = this.opts;
    const { pubkey } = event;

    if (request.method === 'connect') {
      if (onConnect) {
        const response = await onConnect(request, event);
        return this.sendResponse(pubkey, response);
      }
      return;
    }

    // Prevent unauthorized access.
    if (!this.authorizedPubkeys.has(pubkey)) {
      return this.sendResponse(pubkey, {
        id: request.id,
        result: '',
        error: 'Unauthorized',
      });
    }

    // Authorized methods.
    switch (request.method) {
      case 'sign_event':
        return this.sendResponse(pubkey, {
          id: request.id,
          result: JSON.stringify(await userSigner.signEvent(JSON.parse(request.params[0]))),
        });
      case 'ping':
        return this.sendResponse(pubkey, {
          id: request.id,
          result: 'pong',
        });
      case 'get_relays':
        return this.sendResponse(pubkey, {
          id: request.id,
          result: JSON.stringify(await userSigner.getRelays?.() ?? []),
        });
      case 'get_public_key':
        return this.sendResponse(pubkey, {
          id: request.id,
          result: await userSigner.getPublicKey(),
        });
      case 'nip04_encrypt':
        return this.sendResponse(pubkey, {
          id: request.id,
          result: await userSigner.nip04!.encrypt(request.params[0], request.params[1]),
        });
      case 'nip04_decrypt':
        return this.sendResponse(pubkey, {
          id: request.id,
          result: await userSigner.nip04!.decrypt(request.params[0], request.params[1]),
        });
      case 'nip44_encrypt':
        return this.sendResponse(pubkey, {
          id: request.id,
          result: await userSigner.nip44!.encrypt(request.params[0], request.params[1]),
        });
      case 'nip44_decrypt':
        return this.sendResponse(pubkey, {
          id: request.id,
          result: await userSigner.nip44!.decrypt(request.params[0], request.params[1]),
        });
      default:
        return this.sendResponse(pubkey, {
          id: request.id,
          result: '',
          error: `Unrecognized method: ${request.method}`,
        });
    }
  }

  /** Encrypt the response with the bunker key, then publish it to the relay. */
  private async sendResponse(pubkey: string, response: NostrConnectResponse): Promise<void> {
    const { bunkerSigner, relay } = this.opts;

    const content = await bunkerSigner.nip44!.encrypt(pubkey, JSON.stringify(response));

    const event = await bunkerSigner.signEvent({
      kind: 24133,
      content,
      tags: [['p', pubkey]],
      created_at: Math.floor(Date.now() / 1000),
    });

    await relay.event(event);
  }

  /** Auto-decrypt NIP-44 or NIP-04 ciphertext. */
  private async decrypt(pubkey: string, ciphertext: string): Promise<string> {
    const { bunkerSigner } = this.opts;
    return await bunkerSigner.nip44!.decrypt(pubkey, ciphertext);
  }

  /** Authorize the pubkey to perform signer actions (ie any other actions besides `connect`). */
  authorize(pubkey: string): void {
    this.authorizedPubkeys.add(pubkey);
  }

  /** Revoke authorization for the pubkey. */
  revoke(pubkey: string): void {
    this.authorizedPubkeys.delete(pubkey);
  }

  /** Stop the bunker and unsubscribe relay subscriptions. */
  close(): void {
    this.controller.abort();
  }

  [Symbol.dispose](): void {
    this.close();
  }

}