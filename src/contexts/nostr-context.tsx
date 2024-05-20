import { NRelay1, NostrSigner } from '@nostrify/nostrify';
import { getPublicKey, nip19 } from 'nostr-tools';
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

import { NKeys } from 'soapbox/features/nostr/keys';
import { useAuthToken } from 'soapbox/hooks/useAuthToken';
import { useInstance } from 'soapbox/hooks/useInstance';

interface NostrContextType {
  relay?: NRelay1;
  pubkey?: string;
  signer?: NostrSigner;
}

const NostrContext = createContext<NostrContextType | undefined>(undefined);

interface NostrProviderProps {
  children: React.ReactNode;
}

export const NostrProvider: React.FC<NostrProviderProps> = ({ children }) => {
  const instance = useInstance();
  const [relay, setRelay] = useState<NRelay1>();

  const token = useAuthToken();

  const url = instance.nostr?.relay;
  const pubkey = instance.nostr?.pubkey;

  let accountPubkey: string | undefined;

  try {
    const result = nip19.decode(token!);
    switch (result.type) {
      case 'npub':
        accountPubkey = result.data;
        break;
      case 'nsec':
        accountPubkey = getPublicKey(result.data);
        break;
      case 'nprofile':
        accountPubkey = result.data.pubkey;
        break;
    }
  } catch (e) {
    // Ignore
  }

  const signer = useMemo(
    () => (accountPubkey ? NKeys.get(accountPubkey) : undefined) ?? window.nostr,
    [accountPubkey],
  );

  useEffect(() => {
    if (url) {
      setRelay(new NRelay1(url));
    }
    return () => {
      relay?.close();
    };
  }, [url]);

  return (
    <NostrContext.Provider value={{ relay, pubkey, signer }}>
      {children}
    </NostrContext.Provider>
  );
};

export const useNostr = () => {
  const context = useContext(NostrContext);
  if (context === undefined) {
    throw new Error('useNostr must be used within a NostrProvider');
  }
  return context;
};
