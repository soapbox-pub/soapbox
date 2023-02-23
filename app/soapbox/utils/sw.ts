/** Unregister the ServiceWorker */
// https://stackoverflow.com/a/49771828/8811886
const unregisterSw = async(): Promise<void> => {
  if (navigator.serviceWorker) {
    // FIXME: this only works if using a single tab.
    // Send a message to sw.js instead to refresh all tabs.
    const registrations = await navigator.serviceWorker.getRegistrations();
    const unregisterAll = registrations.map(r => r.unregister());
    await Promise.all(unregisterAll);
  }
};

export {
  unregisterSw,
};