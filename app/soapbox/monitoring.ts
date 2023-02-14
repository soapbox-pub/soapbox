import * as BuildConfig from 'soapbox/build-config';

import type { CaptureContext } from '@sentry/types';

export const start = (): void => {
  Promise.all([
    import(/* webpackChunkName: "error" */'@sentry/react'),
    import(/* webpackChunkName: "error" */'@sentry/tracing'),
  ]).then(([Sentry, { Integrations: Integrations }]) => {
    Sentry.init({
      dsn: BuildConfig.SENTRY_DSN,
      environment: BuildConfig.NODE_ENV,
      debug: false,
      integrations: [new Integrations.BrowserTracing()],

      // Filter events.
      // https://docs.sentry.io/platforms/javascript/configuration/filtering/
      ignoreErrors: [
        // Network errors.
        'AxiosError',
        // sw.js couldn't be downloaded.
        'Failed to update a ServiceWorker for scope',
        // Useful for try/catch, useless as a Sentry error.
        'AbortError',
        // localForage error in FireFox private browsing mode (which doesn't support IndexedDB).
        // We only use IndexedDB as a cache, so we can safely ignore the error.
        'No available storage method found',
      ],
      denyUrls: [
        // Browser extensions.
        /extensions\//i,
        /^chrome:\/\//i,
        /^moz-extension:\/\//i,
      ],

      // We recommend adjusting this value in production, or using tracesSampler
      // for finer control
      tracesSampleRate: 1.0,
    });
  }).catch(console.error);
};

export const captureException = (exception: any, captureContext?: CaptureContext | undefined): void => {
  import(/* webpackChunkName: "error" */'@sentry/react')
    .then(Sentry => {
      Sentry.captureException(exception, captureContext);
    })
    .catch(console.error);
};
