import { NSecSigner } from '@nostrify/nostrify';
import { useEffect, useState } from 'react';

import { useNostr } from 'soapbox/contexts/nostr-context';
import { NBunker } from 'soapbox/features/nostr/NBunker';
import { NKeys } from 'soapbox/features/nostr/keys';
import { useAppSelector } from 'soapbox/hooks';
import { useBunkerStore } from 'soapbox/hooks/useBunkerStore';

function useBunker() {
  const { relay } = useNostr();
  const { connections } = useBunkerStore();

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(true);

  const connection = useAppSelector((state) => {
    const accessToken = state.auth.tokens[state.auth.me!]?.access_token;
    if (accessToken) {
      return connections.find((conn) => conn.accessToken === accessToken);
    }
  });

  useEffect(() => {
    if (!relay || !connection) return;

    const bunker = new NBunker({
      relay,
      connection: (() => {
        if (!connection) return;
        const { authorizedPubkey, bunkerSeckey, pubkey } = connection;

        const user = NKeys.get(pubkey) ?? window.nostr;
        if (!user) return;

        return {
          authorizedPubkey,
          signers: {
            user,
            bunker: new NSecSigner(bunkerSeckey),
          },
        };
      })(),
      onSubscribed() {
        setIsSubscribed(true);
        setIsSubscribing(false);
      },
    });

    return () => {
      bunker.close();
    };
  }, [relay, connection]);

  return {
    isSubscribed,
    isSubscribing,
  };
}

export { useBunker };
