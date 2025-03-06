import type { NostrSigner } from '@nostrify/nostrify';

declare module '*.css';
declare module 'swiper/css';


declare global {
  interface Window {
    nostr?: NostrSigner;
  }

  // FIXME: Remove this definition if the fix is merged upstream.
  // https://github.com/egoist/vite-plugin-compile-time/pull/26
  interface ImportMeta {
    compileTime: <T>(id: string) => T;
  }
}