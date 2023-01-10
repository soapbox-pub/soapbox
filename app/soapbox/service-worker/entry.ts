import './web-push-notifications';

declare const self: ServiceWorkerGlobalScope;

// Workbox requires us to put this here, for no apparent reason.
// @ts-ignore
// eslint-disable-next-line no-unused-expressions, no-restricted-globals
self.__WB_MANIFEST;