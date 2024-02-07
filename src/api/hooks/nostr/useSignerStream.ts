import { NiceRelay } from 'nostr-machina';
import { type Event } from 'nostr-tools';
import { useEffect, useMemo } from 'react';

import { nip04, signEvent } from 'soapbox/features/nostr/sign';
import { useInstance } from 'soapbox/hooks';
import { connectRequestSchema, nwcRequestSchema } from 'soapbox/schemas/nostr';
import { jsonSchema } from 'soapbox/schemas/utils';

function useSignerStream() {
  const instance = useInstance();

  const relayUrl = instance.nostr?.relay;
  const pubkey = instance.nostr?.pubkey;

  const relay = useMemo(() => {
    if (relayUrl) {
      return new NiceRelay(relayUrl);
    }
  }, [relayUrl]);

  async function handleConnectEvent(event: Event) {
    if (!relay || !pubkey) return;
    const decrypted = await nip04.decrypt(pubkey, event.content);

    const reqMsg = jsonSchema.pipe(connectRequestSchema).safeParse(decrypted);
    if (!reqMsg.success) {
      console.warn(decrypted);
      console.warn(reqMsg.error);
      return;
    }

    const respMsg = {
      id: reqMsg.data.id,
      result: await signEvent(reqMsg.data.params[0], reqMsg.data.params[1]),
    };

    const respEvent = await signEvent({
      kind: 24133,
      content: await nip04.encrypt(pubkey, JSON.stringify(respMsg)),
      tags: [['p', pubkey]],
      created_at: Math.floor(Date.now() / 1000),
    });

    relay.send(['EVENT', respEvent]);
  }

  async function handleWalletEvent(event: Event) {
    if (!relay || !pubkey) return;

    const decrypted = await nip04.decrypt(pubkey, event.content);

    const reqMsg = jsonSchema.pipe(nwcRequestSchema).safeParse(decrypted);
    if (!reqMsg.success) {
      console.warn(decrypted);
      console.warn(reqMsg.error);
      return;
    }

    await window.webln?.enable();
    await window.webln?.sendPayment(reqMsg.data.params.invoice);
  }

  useEffect(() => {
    if (!relay || !pubkey) return;
    const sub = relay.req([{ kinds: [24133, 23194], authors: [pubkey], limit: 0 }]);

    const readEvents = async () => {
      for await (const event of sub) {
        switch (event.kind) {
          case 24133:
            await handleConnectEvent(event);
            break;
          case 23194:
            await handleWalletEvent(event);
            break;
        }
      }
    };

    readEvents();

    return () => {
      relay?.close();
    };
  }, [relay, pubkey]);
}

export { useSignerStream };
