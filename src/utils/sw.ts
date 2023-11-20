/** Register the ServiceWorker. */
function registerSW(path: string) {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register(path, { scope: '/' });
    });
  }
}

/** Prevent a new ServiceWorker from being installed. */
function lockSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register = () => {
      throw new Error('ServiceWorker already registered.');
    };
  }
}

/** Unregister the ServiceWorker */
// https://stackoverflow.com/a/49771828/8811886
const unregisterSW = async(): Promise<void> => {
  if (navigator.serviceWorker) {
    // FIXME: this only works if using a single tab.
    // Send a message to sw.js instead to refresh all tabs.
    const registrations = await navigator.serviceWorker.getRegistrations();
    const unregisterAll = registrations.map(r => r.unregister());
    await Promise.all(unregisterAll);
  }
};

export {
  registerSW,
  unregisterSW,
  lockSW,
};