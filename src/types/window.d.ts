import type { NostrSigner } from 'nspec';

declare global {
  interface Window {
    nostr?: NostrSigner;
  }
}