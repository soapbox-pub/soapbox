import type Nostr from './nostr';

declare global {
  interface Window {
    nostr?: Nostr
  }
}