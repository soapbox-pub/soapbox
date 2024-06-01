import { useEffect, useState } from 'react';

import { useNostr } from 'soapbox/contexts/nostr-context';
import { NConnect } from 'soapbox/features/nostr/NConnect';

const secretStorageKey = 'soapbox:nip46:secret';

sessionStorage.setItem(secretStorageKey, crypto.randomUUID());

function useSignerStream() {
  const { relay, signer } = useNostr();
  const [pubkey, setPubkey] = useState<string | undefined>(undefined);

  const authStorageKey = `soapbox:nostr:auth:${pubkey}`;

  useEffect(() => {
    let isCancelled = false;

    if (signer) {
      signer.getPublicKey().then((newPubkey) => {
        if (!isCancelled) {
          setPubkey(newPubkey);
        }
      }).catch(console.warn);
    }

    return () => {
      isCancelled = true;
    };
  }, [signer]);

  useEffect(() => {
    if (!relay || !signer || !pubkey) return;

    const connect = new NConnect({
      relay,
      signer,
      onAuthorize(authorizedPubkey) {
        localStorage.setItem(authStorageKey, authorizedPubkey);
        sessionStorage.setItem(secretStorageKey, crypto.randomUUID());
      },
      authorizedPubkey: localStorage.getItem(authStorageKey) ?? undefined,
      getSecret: () => sessionStorage.getItem(secretStorageKey)!,
    });

    return () => {
      connect.close();
    };
  }, [relay, signer, pubkey]);
}

export { useSignerStream };
