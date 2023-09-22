/**
 * Build config: configuration set at build time.
 * @module soapbox/build-config
 */

// eslint-disable-next-line import/extensions
import trim from 'lodash/trim.js';
// eslint-disable-next-line import/extensions
import trimEnd from 'lodash/trimEnd.js';

const {
  NODE_ENV,
  BACKEND_URL,
  FE_SUBDIRECTORY,
  FE_INSTANCE_SOURCE_DIR,
  SENTRY_DSN,
} = process.env;

const sanitizeURL = (url: string | undefined = ''): string => {
  try {
    return trimEnd(new URL(url).toString(), '/');
  } catch {
    return '';
  }
};

const sanitizeBasename = (path: string | undefined = ''): string => {
  return `/${trim(path, '/')}`;
};

const env = {
  NODE_ENV: NODE_ENV || 'development',
  BACKEND_URL: sanitizeURL(BACKEND_URL),
  FE_SUBDIRECTORY: sanitizeBasename(FE_SUBDIRECTORY),
  FE_INSTANCE_SOURCE_DIR: FE_INSTANCE_SOURCE_DIR || 'instance',
  SENTRY_DSN,
};

export type SoapboxEnv = typeof env;

export default () => ({
  data: env,
});
