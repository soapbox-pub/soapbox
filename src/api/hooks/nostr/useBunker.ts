import { NSecSigner } from '@nostrify/nostrify';
import { nip19 } from 'nostr-tools';
import { useEffect, useState } from 'react';

import { useNostr } from 'soapbox/contexts/nostr-context';
import { NBunker, NBunkerOpts } from 'soapbox/features/nostr/NBunker';
import { NKeys } from 'soapbox/features/nostr/keys';
import { useAppSelector } from 'soapbox/hooks';

const secretStorageKey = 'soapbox:nip46:secret';

sessionStorage.setItem(secretStorageKey, crypto.randomUUID());

function useBunker() {
  const { relay } = useNostr();

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(true);

  const authorizations = useAppSelector((state) => state.bunker.authorizations);

  const connection = useAppSelector((state) => {
    const accessToken = state.auth.tokens[state.auth.me!]?.access_token;
    if (accessToken) {
      return state.bunker.connections.find((conn) => conn.accessToken === accessToken);
    }
  });

  useEffect(() => {
    if (!relay || (!connection && !authorizations.length)) return;

    const bunker = new NBunker({
      relay,
      connection: (() => {
        if (!connection) return;
        const { authorizedPubkey, bunkerSeckey, pubkey } = connection;

        const user = NKeys.get(pubkey) ?? window.nostr;
        if (!user) return;

        const decoded = nip19.decode(bunkerSeckey);
        if (decoded.type !== 'nsec') return;

        return {
          authorizedPubkey,
          signers: {
            user,
            bunker: new NSecSigner(decoded.data),
          },
        };
      })(),
      authorizations: authorizations.reduce((result, auth) => {
        const { secret, pubkey, bunkerSeckey } = auth;

        const user = NKeys.get(pubkey) ?? window.nostr;
        if (!user) return result;

        const decoded = nip19.decode(bunkerSeckey);
        if (decoded.type !== 'nsec') return result;

        result.push({
          secret,
          signers: {
            user,
            bunker: new NSecSigner(decoded.data),
          },
        });

        return result;
      }, [] as NBunkerOpts['authorizations']),
      onAuthorize(authorizedPubkey) {
        sessionStorage.setItem(secretStorageKey, crypto.randomUUID());
      },
      onSubscribed() {
        setIsSubscribed(true);
        setIsSubscribing(false);
      },
    });

    return () => {
      bunker.close();
    };
  }, [relay, connection, authorizations]);

  return {
    isSubscribed,
    isSubscribing,
  };
}

export { useBunker };
