import { NRelay, NRelay1, NostrSigner } from '@nostrify/nostrify';
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

import { NKeys } from 'soapbox/features/nostr/keys';
import { useOwnAccount } from 'soapbox/hooks';
import { useInstance } from 'soapbox/hooks/useInstance';

interface NostrContextType {
  relay?: NRelay;
  signer?: NostrSigner;
}

const NostrContext = createContext<NostrContextType | undefined>(undefined);

interface NostrProviderProps {
  children: React.ReactNode;
}

export const NostrProvider: React.FC<NostrProviderProps> = ({ children }) => {
  const instance = useInstance();
  const [relay, setRelay] = useState<NRelay1>();

  const { account } = useOwnAccount();

  const url = instance.nostr?.relay;
  const accountPubkey = account?.nostr.pubkey;

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
    <NostrContext.Provider value={{ relay, signer }}>
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
