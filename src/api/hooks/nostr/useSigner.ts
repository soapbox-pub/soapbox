import { useQuery } from '@tanstack/react-query';

import { NKeys } from 'soapbox/features/nostr/keys';
import { useAppSelector } from 'soapbox/hooks';
import { useBunkerStore } from 'soapbox/hooks/useBunkerStore';

export function useSigner() {
  const { connections } = useBunkerStore();

  const pubkey = useAppSelector(({ auth }) => {
    const accessToken = auth.me ? auth.tokens[auth.me]?.access_token : undefined;
    if (accessToken) {
      return connections.find((conn) => conn.accessToken === accessToken)?.pubkey;
    }
  });

  const { data: signer, ...rest } = useQuery({
    queryKey: ['nostr', 'signer', pubkey],
    queryFn: async () => {
      if (!pubkey) return null;

      const signer = NKeys.get(pubkey);
      if (signer) return signer;

      if (window.nostr && await window.nostr.getPublicKey() === pubkey) {
        return window.nostr;
      }

      return null;
    },
  });

  return { signer: signer ?? undefined, ...rest };
}