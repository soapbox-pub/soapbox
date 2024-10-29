import { NRelay1, NostrSigner } from '@nostrify/nostrify';
import React, { createContext, useContext, useState, useEffect } from 'react';

import { useSigner } from 'soapbox/api/hooks/nostr/useSigner';
import { useInstance } from 'soapbox/hooks/useInstance';

interface NostrContextType {
  relay?: NRelay1;
  signer?: NostrSigner;
  hasNostr: boolean;
  isRelayOpen: boolean;
}

const NostrContext = createContext<NostrContextType | undefined>(undefined);

interface NostrProviderProps {
  children: React.ReactNode;
}

export const NostrProvider: React.FC<NostrProviderProps> = ({ children }) => {
  const { instance } = useInstance();
  const { signer } = useSigner();

  const hasNostr = !!instance.nostr;

  const [relay, setRelay] = useState<NRelay1>();
  const [isRelayOpen, setIsRelayOpen] = useState(false);

  const url = instance.nostr?.relay;

  const handleRelayOpen = () => {
    setIsRelayOpen(true);
  };

  useEffect(() => {
    if (url) {
      const relay = new NRelay1(url);
      relay.socket.underlyingWebsocket.addEventListener('open', handleRelayOpen);
      setRelay(relay);
    }
    return () => {
      relay?.socket.underlyingWebsocket.removeEventListener('open', handleRelayOpen);
      relay?.close();
    };
  }, [url]);

  return (
    <NostrContext.Provider value={{ relay, signer, isRelayOpen, hasNostr }}>
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
