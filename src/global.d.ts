declare module '*.css';
declare module 'swiper/css';

declare global {
  // FIXME: Remove this definition if the fix is merged upstream.
  // https://github.com/egoist/vite-plugin-compile-time/pull/26
  interface ImportMeta {
    compileTime: <T>(id: string) => T;
  }
}

export {};
