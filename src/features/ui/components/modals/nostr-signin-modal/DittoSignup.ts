import { NRelay, NostrEvent, NostrSigner } from '@soapbox/nspec';

interface DittoSignupRequestOpts {
  dvm: string;
  url: string;
  relay: NRelay;
  signer: NostrSigner;
  signal?: AbortSignal;
}

export class DittoSignup {

  static async request(opts: DittoSignupRequestOpts): Promise<NostrEvent> {
    const { dvm, url, relay, signer, signal } = opts;

    const pubkey = await signer.getPublicKey();
    const event = await signer.signEvent({
      kind: 5951,
      content: '',
      tags: [
        ['i', url, 'text'],
        ['p', dvm],
      ],
      created_at: Math.floor(Date.now() / 1000),
    });

    const subscription = relay.req(
      [{ kinds: [7000, 6951], authors: [dvm], '#p': [pubkey], '#e': [event.id] }],
      { signal },
    );

    await relay.event(event, { signal });

    for await (const msg of subscription) {
      if (msg[0] === 'EVENT') {
        return msg[2];
      }
    }

    throw new Error('DittoSignup: no response');
  }

  static async check(opts: Omit<DittoSignupRequestOpts, 'url'>): Promise<NostrEvent | undefined> {
    const { dvm, relay, signer, signal } = opts;

    const pubkey = await signer.getPublicKey();
    const [event] = await relay.query(
      [{ kinds: [7000, 6951], authors: [dvm], '#p': [pubkey] }],
      { signal },
    );

    return event;
  }

}