import type { NostrSigner } from '@nostrify/nostrify';

declare global {
  interface Window {
    nostr?: NostrSigner;
  }
}