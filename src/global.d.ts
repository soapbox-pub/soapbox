import type { NostrSigner } from '@nostrify/nostrify';

declare global {
  declare interface Window {
    nostr?: NostrSigner;
  }

  // FIXME: Remove this file if the fix is merged upstream.
  // https://github.com/egoist/vite-plugin-compile-time/pull/26
  declare interface ImportMeta {
    compileTime: <T>(id: string) => T;
  }
}