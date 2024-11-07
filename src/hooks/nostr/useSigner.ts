import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { keyring } from 'soapbox/features/nostr/keyring';
import { useAppSelector } from 'soapbox/hooks';
import { useBunkerStore } from 'soapbox/hooks/nostr/useBunkerStore';

export function useSigner() {
  const { connections } = useBunkerStore();

  const connection = useAppSelector(({ auth }) => {
    const accessToken = auth.me ? auth.users[auth.me]?.access_token : undefined;
    if (accessToken) {
      return connections.find((conn) => conn.accessToken === accessToken);
    }
  });

  const { pubkey, bunkerPubkey, authorizedPubkey } = connection ?? {};

  const { data: signer, ...rest } = useQuery({
    queryKey: ['nostr', 'signer', pubkey ?? ''],
    queryFn: async () => {
      if (!pubkey) return null;

      const signer = keyring.get(pubkey);
      if (signer) return signer;

      if (window.nostr && await window.nostr.getPublicKey() === pubkey) {
        return window.nostr;
      }

      return null;
    },
    enabled: !!pubkey,
  });

  const bunkerSigner = useMemo(() => {
    if (bunkerPubkey) {
      return keyring.get(bunkerPubkey);
    }
  }, [bunkerPubkey]);

  return {
    signer: signer ?? undefined,
    bunkerSigner,
    authorizedPubkey,
    ...rest,
  };
}