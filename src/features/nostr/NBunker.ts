import {
  NRelay,
  NostrConnectRequest,
  NostrConnectResponse,
  NostrEvent,
  NostrFilter,
  NostrSigner,
  NSchema as n,
} from '@nostrify/nostrify';

interface NBunkerSigners {
  user: NostrSigner;
  bunker: NostrSigner;
}

interface NBunkerConnection {
  authorizedPubkey: string;
  signers: NBunkerSigners;
}

interface NBunkerAuthorization {
  secret: string;
  signers: NBunkerSigners;
}

export interface NBunkerOpts {
  relay: NRelay;
  connection?: NBunkerConnection;
  authorizations: NBunkerAuthorization[];
  onAuthorize(pubkey: string): void;
  onSubscribed(): void;
}

export class NBunker {

  private relay: NRelay;
  private connection?: NBunkerConnection;
  private authorizations: NBunkerAuthorization[];
  private onAuthorize: (pubkey: string) => void;
  private onSubscribed: () => void;

  private controller = new AbortController();

  constructor(opts: NBunkerOpts) {
    this.relay = opts.relay;
    this.connection = opts.connection;
    this.authorizations = opts.authorizations;
    this.onAuthorize = opts.onAuthorize;
    this.onSubscribed = opts.onSubscribed;

    this.open();
  }

  async open() {
    if (this.connection) {
      this.subscribeConnection(this.connection);
    }
    for (const authorization of this.authorizations) {
      this.subscribeAuthorization(authorization);
    }
    this.onSubscribed();
  }

  private async subscribeAuthorization(authorization: NBunkerAuthorization): Promise<void> {
    const { signers } = authorization;

    const bunkerPubkey = await signers.bunker.getPublicKey();
    const signal = this.controller.signal;

    const filters: NostrFilter[] = [
      { kinds: [24133], '#p': [bunkerPubkey], limit: 0 },
    ];

    for await (const msg of this.relay.req(filters, { signal })) {
      if (msg[0] === 'EVENT') {
        const [,, event] = msg;

        try {
          const request = await this.decryptRequest(event, signers);

          if (request.method === 'connect') {
            this.handleConnect(event, request, authorization);
          }
        } catch (error) {
          console.warn(error);
        }
      }
    }
  }

  private async subscribeConnection(connection: NBunkerConnection): Promise<void> {
    const { authorizedPubkey, signers } = connection;

    const bunkerPubkey = await signers.bunker.getPublicKey();
    const signal = this.controller.signal;

    const filters: NostrFilter[] = [
      { kinds: [24133], authors: [authorizedPubkey], '#p': [bunkerPubkey], limit: 0 },
    ];

    for await (const msg of this.relay.req(filters, { signal })) {
      if (msg[0] === 'EVENT') {
        const [,, event] = msg;

        try {
          const request = await this.decryptRequest(event, signers);
          this.handleRequest(event, request, connection);
        } catch (error) {
          console.warn(error);
        }
      }
    }
  }

  private async decryptRequest(event: NostrEvent, signers: NBunkerSigners): Promise<NostrConnectRequest> {
    const decrypted = await this.decrypt(signers.bunker, event.pubkey, event.content);
    return n.json().pipe(n.connectRequest()).parse(decrypted);
  }

  private async handleRequest(event: NostrEvent, request: NostrConnectRequest, connection: NBunkerConnection): Promise<void> {
    const { signers, authorizedPubkey } = connection;
    const { user } = signers;

    // Prevent unauthorized access.
    if (event.pubkey !== authorizedPubkey) {
      return;
    }

    // Authorized methods.
    switch (request.method) {
      case 'sign_event':
        return this.sendResponse(event.pubkey, {
          id: request.id,
          result: JSON.stringify(await user.signEvent(JSON.parse(request.params[0]))),
        });
      case 'ping':
        return this.sendResponse(event.pubkey, {
          id: request.id,
          result: 'pong',
        });
      case 'get_relays':
        return this.sendResponse(event.pubkey, {
          id: request.id,
          result: JSON.stringify(await user.getRelays?.() ?? []),
        });
      case 'get_public_key':
        return this.sendResponse(event.pubkey, {
          id: request.id,
          result: await user.getPublicKey(),
        });
      case 'nip04_encrypt':
        return this.sendResponse(event.pubkey, {
          id: request.id,
          result: await user.nip04!.encrypt(request.params[0], request.params[1]),
        });
      case 'nip04_decrypt':
        return this.sendResponse(event.pubkey, {
          id: request.id,
          result: await user.nip04!.decrypt(request.params[0], request.params[1]),
        });
      case 'nip44_encrypt':
        return this.sendResponse(event.pubkey, {
          id: request.id,
          result: await user.nip44!.encrypt(request.params[0], request.params[1]),
        });
      case 'nip44_decrypt':
        return this.sendResponse(event.pubkey, {
          id: request.id,
          result: await user.nip44!.decrypt(request.params[0], request.params[1]),
        });
      default:
        return this.sendResponse(event.pubkey, {
          id: request.id,
          result: '',
          error: `Unrecognized method: ${request.method}`,
        });
    }
  }

  private async handleConnect(event: NostrEvent, request: NostrConnectRequest, authorization: NBunkerAuthorization): Promise<void> {
    const [, secret] = request.params;

    if (secret === authorization.secret) {
      this.onAuthorize(event.pubkey);

      await this.sendResponse(event.pubkey, {
        id: request.id,
        result: 'ack',
      });
    }
  }

  private async sendResponse(pubkey: string, response: NostrConnectResponse): Promise<void> {
    const { user } = this.connection?.signers ?? {};

    if (!user) {
      return;
    }

    const event = await user.signEvent({
      kind: 24133,
      content: await user.nip04!.encrypt(pubkey, JSON.stringify(response)),
      tags: [['p', pubkey]],
      created_at: Math.floor(Date.now() / 1000),
    });

    await this.relay.event(event);
  }

  /** Auto-decrypt NIP-44 or NIP-04 ciphertext. */
  private async decrypt(signer: NostrSigner, pubkey: string, ciphertext: string): Promise<string> {
    try {
      return await signer.nip44!.decrypt(pubkey, ciphertext);
    } catch {
      return await signer.nip04!.decrypt(pubkey, ciphertext);
    }
  }

  close() {
    this.controller.abort();
  }

}