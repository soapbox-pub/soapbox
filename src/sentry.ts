import { NODE_ENV } from 'soapbox/build-config.ts';
import sourceCode from 'soapbox/utils/code.ts';

import type { CaptureContext, SendFeedbackParams } from '@sentry/types';
import type { Account } from 'soapbox/schemas/index.ts';

/** Start Sentry. */
async function startSentry(dsn: string): Promise<void> {
  const Sentry = await import('@sentry/react');

  Sentry.init({
    dsn,
    debug: false,
    enabled: NODE_ENV === 'production',
    integrations: [Sentry.browserTracingIntegration()],

    // Filter events.
    // https://docs.sentry.io/platforms/javascript/configuration/filtering/
    ignoreErrors: [
      // Network errors.
      'HTTPError',
      // sw.js couldn't be downloaded.
      'Failed to update a ServiceWorker for scope',
      // Useful for try/catch, useless as a Sentry error.
      'AbortError',
      // localForage error in FireFox private browsing mode (which doesn't support IndexedDB).
      // We only use IndexedDB as a cache, so we can safely ignore the error.
      'No available storage method found',
      // Virtuoso throws these errors, but it is a false-positive.
      // https://github.com/petyosi/react-virtuoso/issues/254
      'ResizeObserver loop completed with undelivered notifications.',
      'ResizeObserver loop limit exceeded',
    ],
    denyUrls: [
      // Browser extensions.
      /extensions\//i,
      /^chrome:\/\//i,
      /^moz-extension:\/\//i,
    ],

    tracesSampleRate: .1,
  });

  Sentry.setContext('soapbox', sourceCode);
}

/** Associate the account with Sentry events. */
async function setSentryAccount(account: Account): Promise<void> {
  const Sentry = await import('@sentry/react');

  Sentry.setUser({
    id: account.id,
    username: account.acct,
    url: account.url,
  });
}

/** Remove the account from Sentry events. */
async function unsetSentryAccount(): Promise<void> {
  const Sentry = await import('@sentry/react');
  Sentry.setUser(null);
}

/** Capture the exception and report it to Sentry. */
async function captureSentryException (
  exception: any,
  captureContext?: CaptureContext | undefined,
): Promise<string> {
  const Sentry = await import('@sentry/react');
  return Sentry.captureException(exception, captureContext);
}

/** Capture user feedback and report it to Sentry. */
async function captureSentryFeedback(feedback: SendFeedbackParams): Promise<void> {
  const Sentry = await import('@sentry/react');
  Sentry.captureFeedback(feedback);
}

export {
  startSentry,
  setSentryAccount,
  unsetSentryAccount,
  captureSentryException,
  captureSentryFeedback,
};