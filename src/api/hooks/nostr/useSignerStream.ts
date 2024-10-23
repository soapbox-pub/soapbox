import { useEffect, useState } from 'react';

import { useNostr } from 'soapbox/contexts/nostr-context';
import { NBunker } from 'soapbox/features/nostr/NBunker';

const secretStorageKey = 'soapbox:nip46:secret';

sessionStorage.setItem(secretStorageKey, crypto.randomUUID());

function useSignerStream() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(true);

  const { relay, signer, hasNostr } = useNostr();
  const [pubkey, setPubkey] = useState<string | undefined>(undefined);

  const authStorageKey = `soapbox:nostr:auth:${pubkey}`;

  useEffect(() => {
    let isCancelled = false;

    if (signer && hasNostr) {
      signer.getPublicKey().then((newPubkey) => {
        if (!isCancelled) {
          setPubkey(newPubkey);
        }
      }).catch(console.warn);
    }

    return () => {
      isCancelled = true;
    };
  }, [signer, hasNostr]);

  useEffect(() => {
    if (!relay || !signer || !pubkey) return;

    const bunker = new NBunker({
      relay,
      signer,
      onAuthorize(authorizedPubkey) {
        localStorage.setItem(authStorageKey, authorizedPubkey);
        sessionStorage.setItem(secretStorageKey, crypto.randomUUID());
      },
      onSubscribed() {
        setIsSubscribed(true);
        setIsSubscribing(false);
      },
      authorizedPubkey: localStorage.getItem(authStorageKey) ?? undefined,
      getSecret: () => sessionStorage.getItem(secretStorageKey)!,
    });

    return () => {
      bunker.close();
    };
  }, [relay, signer, pubkey]);

  return {
    isSubscribed,
    isSubscribing,
  };
}

export { useSignerStream };
