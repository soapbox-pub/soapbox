import { RelayPool } from 'nostr-relaypool';
import { useEffect } from 'react';

import { signEvent, nip04 } from 'soapbox/features/nostr/sign';
import { useInstance } from 'soapbox/hooks';
import { connectRequestSchema } from 'soapbox/schemas/nostr';
import { jsonSchema } from 'soapbox/schemas/utils';

/** Have one pool for the whole application. */
let pool: RelayPool | undefined;

function useSignerStream() {
  const { nostr } = useInstance();

  const relayUrl = nostr.get('relay') as string | undefined;
  const pubkey = nostr.get('pubkey') as string | undefined;

  useEffect(() => {
    if (!pool && relayUrl && pubkey) {
      pool = new RelayPool([relayUrl]);

      pool.subscribe(
        [{ kinds: [24133], authors: [pubkey], limit: 0 }],
        [relayUrl],
        async (event) => {
          if (!pool) return;

          const decrypted = await nip04.decrypt(pubkey, event.content);
          const reqMsg = jsonSchema.pipe(connectRequestSchema).safeParse(decrypted);

          if (!reqMsg.success) {
            console.warn(decrypted);
            console.warn(reqMsg.error);
            return;
          }

          const signed = await signEvent(reqMsg.data.params[0]);
          const respMsg = {
            id: reqMsg.data.id,
            result: signed,
          };

          const respEvent = await signEvent({
            kind: 24133,
            content: await nip04.encrypt(pubkey, JSON.stringify(respMsg)),
            tags: [['p', pubkey]],
            created_at: Math.floor(Date.now() / 1000),
          });

          pool.publish(respEvent, [relayUrl]);
        },
      );
    }
  }, [relayUrl, pubkey]);
}

export { useSignerStream };
