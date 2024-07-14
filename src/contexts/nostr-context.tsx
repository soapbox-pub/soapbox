import { NRelay, NRelay1, NostrSigner } from '@nostrify/nostrify';
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

import { NKeys } from 'soapbox/features/nostr/keys';
import { useAppSelector, useOwnAccount } from 'soapbox/hooks';
import { useInstance } from 'soapbox/hooks/useInstance';

interface NostrContextType {
  relay?: NRelay;
  signer?: NostrSigner;
  hasNostr: boolean;
  isRelayOpen: boolean;
}

const NostrContext = createContext<NostrContextType | undefined>(undefined);

interface NostrProviderProps {
  children: React.ReactNode;
}

export const NostrProvider: React.FC<NostrProviderProps> = ({ children }) => {
  const instance = useInstance();
  const hasNostr = !!instance.nostr;

  const [relay, setRelay] = useState<NRelay1>();
  const [isRelayOpen, setIsRelayOpen] = useState(false);

  const { account } = useOwnAccount();

  const url = instance.nostr?.relay;
  const accountPubkey = useAppSelector((state) => account?.nostr.pubkey ?? state.meta.pubkey);

  const signer = useMemo(
    () => (accountPubkey ? NKeys.get(accountPubkey) : undefined) ?? window.nostr,
    [accountPubkey, window.nostr],
  );

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
