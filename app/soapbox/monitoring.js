import { NODE_ENV } from 'soapbox/build_config';

export const start = (dsn) => {
  Promise.all([
    import(/* webpackChunkName: "error" */'@sentry/react'),
    import(/* webpackChunkName: "error" */'@sentry/tracing'),
  ]).then(([Sentry, { Integrations: Integrations }]) => {
    Sentry.init({
      dsn,
      environment: NODE_ENV,
      debug: false,
      integrations: [new Integrations.BrowserTracing()],

      // We recommend adjusting this value in production, or using tracesSampler
      // for finer control
      tracesSampleRate: 1.0,
    });
  }).catch(console.error);
};

export const captureException = error => {
  import(/* webpackChunkName: "error" */'@sentry/react')
    .then(Sentry => {
      Sentry.captureException(error);
    })
    .catch(console.error);
};
