import { useState, useEffect } from 'react';
import { useAppSelector } from 'soapbox/hooks/useAppSelector';

export const useRelays = (): string[] => {
  // Default relays if nothing is configured
  const defaultRelays = [
    'wss://relay.damus.io',
    'wss://relay.nostr.band', 
    'wss://nos.lol'
  ];
  
  // In a real implementation, we'd fetch this from app state/config
  // For now we're just returning default relays
  return defaultRelays;
};

export const useBunker = () => {
  // Placeholder for future Nostr bunker implementation
  return {
    isConnected: false,
    connect: () => Promise.resolve(false),
    disconnect: () => {},
  };
};

export default useBunker;