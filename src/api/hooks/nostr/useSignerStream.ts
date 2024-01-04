import { NiceRelay } from 'nostr-machina';
import { useEffect, useMemo } from 'react';

import { nip04, signEvent } from 'soapbox/features/nostr/sign';
import { useInstance } from 'soapbox/hooks';
import { connectRequestSchema } from 'soapbox/schemas/nostr';
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

  useEffect(() => {
    if (!relay || !pubkey) return;

    const sub = relay.req([{ kinds: [24133], authors: [pubkey], limit: 0 }]);

    const readEvents = async () => {
      for await (const event of sub) {
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
    };

    readEvents();

    return () => {
      relay?.close();
    };
  }, [relay, pubkey]);
}

export { useSignerStream };
