'use strict';

// Convenience function to load polyfills and return a promise when it's done.
// If there are no polyfills, then this is just Promise.resolve() which means
// it will execute in the same tick of the event loop (i.e. near-instant).

function importBasePolyfills() {
  return import(/* webpackChunkName: "base_polyfills" */ './base-polyfills');
}

function importExtraPolyfills() {
  return import(/* webpackChunkName: "extra_polyfills" */ './extra-polyfills');
}

function loadPolyfills() {
  const needsBasePolyfills = !(
    // @ts-ignore
    Array.prototype.includes &&
    // @ts-ignore
    HTMLCanvasElement.prototype.toBlob &&
    window.Intl &&
    // @ts-ignore
    Number.isNaN &&
    // @ts-ignore
    Object.assign &&
    // @ts-ignore
    Object.values &&
    window.Symbol
  );

  // Older versions of Firefox and Safari do not have IntersectionObserver.
  // This avoids shipping them all the polyfills.
  const needsExtraPolyfills = !(
    window.IntersectionObserver &&
    window.IntersectionObserverEntry &&
    'isIntersecting' in IntersectionObserverEntry.prototype &&
    (typeof (window.requestIdleCallback) === 'function') &&
    'object-fit' in (new Image()).style
  );

  return Promise.all([
    needsBasePolyfills && importBasePolyfills(),
    needsExtraPolyfills && importExtraPolyfills(),
  ]);
}

export default loadPolyfills;
