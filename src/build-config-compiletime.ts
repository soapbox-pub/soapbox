/**
 * Build config: configuration set at build time.
 * @module soapbox/build-config
 */

const {
  NODE_ENV,
  BACKEND_URL,
  FE_INSTANCE_SOURCE_DIR,
  SENTRY_DSN,
} = process.env;

const sanitizeURL = (url: string = ''): string => {
  try {
    return new URL(url).href;
  } catch {
    return '';
  }
};

const env = {
  NODE_ENV: NODE_ENV || 'development',
  BACKEND_URL: sanitizeURL(BACKEND_URL),
  FE_INSTANCE_SOURCE_DIR: FE_INSTANCE_SOURCE_DIR || 'instance',
  SENTRY_DSN,
};

export type SoapboxEnv = typeof env;

export default () => ({
  data: env,
});
