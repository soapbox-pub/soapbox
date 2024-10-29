import {
  NRelay,
  NostrConnectRequest,
  NostrConnectResponse,
  NostrEvent,
  NostrFilter,
  NostrSigner,
  NSchema as n,
} from '@nostrify/nostrify';

export class NostrRPC {

  constructor(
    private relay: NRelay,
    private signer: NostrSigner,
  ) {}

  async *req(
    filters: NostrFilter[],
    opts: { signal?: AbortSignal },
  ): AsyncIterable<{
    requestEvent: NostrEvent;
    request: NostrConnectRequest;
    respond: (response: Omit<NostrConnectResponse, 'id'>) => Promise<void>;
  }> {
    for await (const msg of this.relay.req(filters, opts)) {
      if (msg[0] === 'EVENT') {
        const [,, requestEvent] = msg;

        const decrypted = await this.decrypt(this.signer, requestEvent.pubkey, requestEvent.content);
        const request = n.json().pipe(n.connectRequest()).parse(decrypted);

        const respond = async (response: Omit<NostrConnectResponse, 'id'>): Promise<void> => {
          await this.respond(requestEvent, { ...response, id: request.id });
        };

        yield { requestEvent, request, respond };
      }

      if (msg[0] === 'CLOSED') {
        break;
      }
    }
  }

  private async respond(requestEvent: NostrEvent, response: NostrConnectResponse): Promise<void> {
    const responseEvent = await this.signer.signEvent({
      kind: 24133,
      content: await this.signer.nip04!.encrypt(requestEvent.pubkey, JSON.stringify(response)),
      tags: [['p', requestEvent.pubkey]],
      created_at: Math.floor(Date.now() / 1000),
    });

    await this.relay.event(responseEvent);
  }

  /** Auto-decrypt NIP-44 or NIP-04 ciphertext. */
  private async decrypt(signer: NostrSigner, pubkey: string, ciphertext: string): Promise<string> {
    try {
      return await signer.nip44!.decrypt(pubkey, ciphertext);
    } catch {
      return await signer.nip04!.decrypt(pubkey, ciphertext);
    }
  }

}