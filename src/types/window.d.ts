import type { NostrSigner } from '@soapbox/nspec';

declare global {
  interface Window {
    nostr?: NostrSigner;
  }
}