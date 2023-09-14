/** Register the ServiceWorker from `/sw.js` */
function registerSW(path: string) {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register(path, { scope: '/' });
    });
  }
}

export { registerSW };