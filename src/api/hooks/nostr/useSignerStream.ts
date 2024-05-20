import { NostrEvent, NostrConnectResponse, NSchema as n } from '@nostrify/nostrify';
import { useEffect } from 'react';

import { useNostr } from 'soapbox/contexts/nostr-context';
import { nwcRequestSchema } from 'soapbox/schemas/nostr';

let onOpen: () => void;
const open = new Promise<void>((resolve) => {
  onOpen = resolve;
});

function useSignerStream() {
  const { relay, pubkey, signer } = useNostr();

  async function sendConnect(response: NostrConnectResponse) {
    if (!relay || !pubkey || !signer) return;

    const event = await signer.signEvent({
      kind: 24133,
      content: await signer.nip04!.encrypt(pubkey, JSON.stringify(response)),
      tags: [['p', pubkey]],
      created_at: Math.floor(Date.now() / 1000),
    });

    relay.event(event);
  }

  async function handleConnectEvent(event: NostrEvent) {
    if (!relay || !pubkey || !signer) return;
    const decrypted = await signer.nip04!.decrypt(pubkey, event.content);

    const reqMsg = n.json().pipe(n.connectRequest()).safeParse(decrypted);
    if (!reqMsg.success) {
      console.warn(decrypted);
      console.warn(reqMsg.error);
      return;
    }

    const request = reqMsg.data;

    switch (request.method) {
      case 'connect':
        return sendConnect({
          id: request.id,
          result: 'ack',
        });
      case 'sign_event':
        return sendConnect({
          id: request.id,
          result: JSON.stringify(await signer.signEvent(JSON.parse(request.params[0]))),
        });
      case 'ping':
        return sendConnect({
          id: request.id,
          result: 'pong',
        });
      case 'get_relays':
        return sendConnect({
          id: request.id,
          result: JSON.stringify(await signer.getRelays?.() ?? []),
        });
      case 'get_public_key':
        return sendConnect({
          id: request.id,
          result: await signer.getPublicKey(),
        });
      case 'nip04_encrypt':
        return sendConnect({
          id: request.id,
          result: await signer.nip04!.encrypt(request.params[0], request.params[1]),
        });
      case 'nip04_decrypt':
        return sendConnect({
          id: request.id,
          result: await signer.nip04!.decrypt(request.params[0], request.params[1]),
        });
      case 'nip44_encrypt':
        return sendConnect({
          id: request.id,
          result: await signer.nip44!.encrypt(request.params[0], request.params[1]),
        });
      case 'nip44_decrypt':
        return sendConnect({
          id: request.id,
          result: await signer.nip44!.decrypt(request.params[0], request.params[1]),
        });
      default:
        return sendConnect({
          id: request.id,
          result: '',
          error: `Unrecognized method: ${request.method}`,
        });
    }
  }

  async function handleWalletEvent(event: NostrEvent) {
    if (!relay || !pubkey || !signer) return;

    const decrypted = await signer.nip04!.decrypt(pubkey, event.content);

    const reqMsg = n.json().pipe(nwcRequestSchema).safeParse(decrypted);
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

  useEffect(() => {
    if (relay) {
      if (relay.socket.readyState === WebSocket.OPEN) {
        onOpen();
      } else {
        relay.socket.addEventListener('open', onOpen, { once: true });
      }
    }
  }, [relay]);

  return { open };
}

export { useSignerStream };
