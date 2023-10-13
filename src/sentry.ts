import sourceCode from 'soapbox/utils/code';

import type { Account } from './schemas';

/** Start Sentry. */
async function startSentry(dsn: string): Promise<void> {
  const [Sentry, { Integrations: Integrations }] = await Promise.all([
    import('@sentry/react'),
    import('@sentry/tracing'),
  ]);

  Sentry.init({
    dsn,
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

  Sentry.setContext('soapbox', sourceCode);
}

/** Associate the account with Sentry events. */
async function setSentryAccount(account: Account) {
  const Sentry = await import('@sentry/react');

  Sentry.setUser({
    id: account.id,
    username: account.acct,
    url: account.url,
  });
}

/** Remove the account from Sentry events. */
async function unsetSentryAccount() {
  const Sentry = await import('@sentry/react');
  Sentry.setUser(null);
}

export { startSentry, setSentryAccount, unsetSentryAccount };