import { NRelay1, NostrSigner } from '@nostrify/nostrify';
import React, { createContext, useContext, useState, useEffect } from 'react';

import { useSigner } from 'soapbox/api/hooks/nostr/useSigner';
import { useInstance } from 'soapbox/hooks/useInstance';

interface NostrContextType {
  relay?: NRelay1;
  signer?: NostrSigner;
  isRelayLoading: boolean;
}

const NostrContext = createContext<NostrContextType | undefined>(undefined);

interface NostrProviderProps {
  children: React.ReactNode;
}

export const NostrProvider: React.FC<NostrProviderProps> = ({ children }) => {
  const { instance } = useInstance();
  const { signer } = useSigner();

  const [relay, setRelay] = useState<NRelay1>();
  const [isRelayLoading, setIsRelayLoading] = useState(true);

  const relayUrl = instance.nostr?.relay;

  const handleRelayOpen = () => {
    setIsRelayLoading(false);
  };

  useEffect(() => {
    if (relayUrl) {
      const relay = new NRelay1(relayUrl);
      relay.socket.underlyingWebsocket.addEventListener('open', handleRelayOpen);
      setRelay(relay);
    } else {
      setIsRelayLoading(false);
    }
    return () => {
      relay?.socket.underlyingWebsocket.removeEventListener('open', handleRelayOpen);
      relay?.close();
    };
  }, [relayUrl]);

  return (
    <NostrContext.Provider value={{ relay, signer, isRelayLoading }}>
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
