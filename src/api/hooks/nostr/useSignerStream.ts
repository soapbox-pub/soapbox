import { useEffect, useState } from 'react';

import { useNostr } from 'soapbox/contexts/nostr-context';
import { NConnect } from 'soapbox/features/nostr/NConnect';

function useSignerStream() {
  const { relay, signer } = useNostr();
  const [pubkey, setPubkey] = useState<string | undefined>(undefined);

  const storageKey = `soapbox:nostr:auth:${pubkey}`;

  useEffect(() => {
    if (signer) {
      signer.getPublicKey().then(setPubkey).catch(console.warn);
    }
  }, [signer]);

  useEffect(() => {
    if (!relay || !signer || !pubkey) return;

    const connect = new NConnect({
      relay,
      signer,
      onAuthorize: (authorizedPubkey) => localStorage.setItem(storageKey, authorizedPubkey),
      authorizedPubkey: localStorage.getItem(storageKey) ?? undefined,
    });

    return () => {
      connect.close();
    };

  }, [relay, signer, pubkey]);
}

export { useSignerStream };
