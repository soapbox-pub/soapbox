import { useEffect, useState } from 'react';

import { useNostr } from 'soapbox/contexts/nostr-context';
import { NConnect } from 'soapbox/features/nostr/NConnect';

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

    const connect = new NConnect({
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
      connect.close();
    };
  }, [relay, signer, pubkey]);

  return {
    isSubscribed,
    isSubscribing,
  };
}

export { useSignerStream };
