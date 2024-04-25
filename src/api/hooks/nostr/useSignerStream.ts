import { type NostrEvent } from '@nostrify/nostrify';
import { useEffect } from 'react';

import { useNostr } from 'soapbox/contexts/nostr-context';
import { connectRequestSchema, nwcRequestSchema } from 'soapbox/schemas/nostr';
import { jsonSchema } from 'soapbox/schemas/utils';

function useSignerStream() {
  const { relay, pubkey, signer } = useNostr();

  async function handleConnectEvent(event: NostrEvent) {
    if (!relay || !pubkey || !signer) return;
    const decrypted = await signer.nip04!.decrypt(pubkey, event.content);

    const reqMsg = jsonSchema.pipe(connectRequestSchema).safeParse(decrypted);
    if (!reqMsg.success) {
      console.warn(decrypted);
      console.warn(reqMsg.error);
      return;
    }

    const respMsg = {
      id: reqMsg.data.id,
      result: await signer.signEvent(reqMsg.data.params[0]),
    };

    const respEvent = await signer.signEvent({
      kind: 24133,
      content: await signer.nip04!.encrypt(pubkey, JSON.stringify(respMsg)),
      tags: [['p', pubkey]],
      created_at: Math.floor(Date.now() / 1000),
    });

    relay.event(respEvent);
  }

  async function handleWalletEvent(event: NostrEvent) {
    if (!relay || !pubkey || !signer) return;

    const decrypted = await signer.nip04!.decrypt(pubkey, event.content);

    const reqMsg = jsonSchema.pipe(nwcRequestSchema).safeParse(decrypted);
    if (!reqMsg.success) {
      console.warn(decrypted);
      console.warn(reqMsg.error);
      return;
    }

    await window.webln?.enable();
    await window.webln?.sendPayment(reqMsg.data.params.invoice);
  }

  async function handleEvent(event: NostrEvent) {
    switch (event.kind) {
      case 24133:
        await handleConnectEvent(event);
        break;
      case 23194:
        await handleWalletEvent(event);
        break;
    }
  }

  useEffect(() => {
    if (!relay || !pubkey) return;

    const controller = new AbortController();
    const signal = controller.signal;

    (async() => {
      for await (const msg of relay.req([{ kinds: [24133, 23194], authors: [pubkey], limit: 0 }], { signal })) {
        if (msg[0] === 'EVENT') handleEvent(msg[2]);
      }
    })();

    return () => {
      controller.abort();
    };

  }, [relay, pubkey, signer]);
}

export { useSignerStream };
