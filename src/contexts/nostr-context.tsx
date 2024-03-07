import { NRelay, NRelay1, NostrSigner } from '@soapbox/nspec';
import React, { createContext, useContext, useState, useEffect } from 'react';

import { signer } from 'soapbox/features/nostr/sign';
import { useInstance } from 'soapbox/hooks/useInstance';

interface NostrContextType {
  relay?: NRelay;
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

  const url = instance.nostr?.relay;
  const pubkey = instance.nostr?.pubkey;

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
