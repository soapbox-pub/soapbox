import type { CaptureContext } from '@sentry/types';

/** Capture the exception and report it to Sentry. */
async function captureException (exception: any, captureContext?: CaptureContext | undefined): Promise<void> {
  try {
    const Sentry = await import('@sentry/react');
    Sentry.captureException(exception, captureContext);
  } catch (e) {
    console.error(e);
  }
}

export { captureException };
