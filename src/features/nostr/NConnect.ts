import { NRelay, NostrConnectRequest, NostrConnectResponse, NostrEvent, NostrSigner, NSchema as n } from '@nostrify/nostrify';

interface NConnectOpts {
  relay: NRelay;
  signer: NostrSigner;
  authorizedPubkey: string | undefined;
  onAuthorize(pubkey: string): void;
  getSecret(): string;
}

export class NConnect {

  private relay: NRelay;
  private signer: NostrSigner;
  private authorizedPubkey: string | undefined;
  private onAuthorize: (pubkey: string) => void;
  private getSecret: () => string;

  private controller = new AbortController();

  constructor(opts: NConnectOpts) {
    this.relay = opts.relay;
    this.signer = opts.signer;
    this.authorizedPubkey = opts.authorizedPubkey;
    this.onAuthorize = opts.onAuthorize;
    this.getSecret = opts.getSecret;

    this.open();
  }

  async open() {
    const pubkey = await this.signer.getPublicKey();
    const signal = this.controller.signal;

    for await (const msg of this.relay.req([{ kinds: [24133], '#p': [pubkey], limit: 0 }], { signal })) {
      if (msg[0] === 'EVENT') {
        const event = msg[2];
        this.handleEvent(event);
      }
    }
  }

  private async handleEvent(event: NostrEvent): Promise<void> {
    const decrypted = await this.signer.nip04!.decrypt(event.pubkey, event.content);
    const request = n.json().pipe(n.connectRequest()).safeParse(decrypted);

    if (!request.success) {
      console.warn(decrypted);
      console.warn(request.error);
      return;
    }

    await this.handleRequest(event.pubkey, request.data);
  }

  private async handleRequest(pubkey: string, request: NostrConnectRequest): Promise<void> {
    // Connect is a special case. Any pubkey can try to request it.
    if (request.method === 'connect') {
      return this.handleConnect(pubkey, request as NostrConnectRequest & { method: 'connect' });
    }

    // Prevent unauthorized access.
    if (pubkey !== this.authorizedPubkey) {
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
          result: JSON.stringify(await this.signer.signEvent(JSON.parse(request.params[0]))),
        });
      case 'ping':
        return this.sendResponse(pubkey, {
          id: request.id,
          result: 'pong',
        });
      case 'get_relays':
        return this.sendResponse(pubkey, {
          id: request.id,
          result: JSON.stringify(await this.signer.getRelays?.() ?? []),
        });
      case 'get_public_key':
        return this.sendResponse(pubkey, {
          id: request.id,
          result: await this.signer.getPublicKey(),
        });
      case 'nip04_encrypt':
        return this.sendResponse(pubkey, {
          id: request.id,
          result: await this.signer.nip04!.encrypt(request.params[0], request.params[1]),
        });
      case 'nip04_decrypt':
        return this.sendResponse(pubkey, {
          id: request.id,
          result: await this.signer.nip04!.decrypt(request.params[0], request.params[1]),
        });
      case 'nip44_encrypt':
        return this.sendResponse(pubkey, {
          id: request.id,
          result: await this.signer.nip44!.encrypt(request.params[0], request.params[1]),
        });
      case 'nip44_decrypt':
        return this.sendResponse(pubkey, {
          id: request.id,
          result: await this.signer.nip44!.decrypt(request.params[0], request.params[1]),
        });
      default:
        return this.sendResponse(pubkey, {
          id: request.id,
          result: '',
          error: `Unrecognized method: ${request.method}`,
        });
    }
  }

  private async handleConnect(pubkey: string, request: NostrConnectRequest & { method: 'connect' }) {
    const [remotePubkey, secret] = request.params;

    if (secret === this.getSecret() && remotePubkey === await this.signer.getPublicKey()) {
      this.authorizedPubkey = pubkey;
      this.onAuthorize(pubkey);

      await this.sendResponse(pubkey, {
        id: request.id,
        result: 'ack',
      });
    }
  }

  private async sendResponse(pubkey: string, response: NostrConnectResponse) {
    const event = await this.signer.signEvent({
      kind: 24133,
      content: await this.signer.nip04!.encrypt(pubkey, JSON.stringify(response)),
      tags: [['p', pubkey]],
      created_at: Math.floor(Date.now() / 1000),
    });

    await this.relay.event(event);
  }

  close() {
    this.controller.abort();
  }

}