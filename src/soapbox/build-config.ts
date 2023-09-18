// @ts-nocheck
const {
  NODE_ENV,
  BACKEND_URL,
  FE_SUBDIRECTORY,
  FE_BUILD_DIR,
  FE_INSTANCE_SOURCE_DIR,
  SENTRY_DSN,
} = import.meta.compileTime('./build-config-compiletime.ts');

export {
  NODE_ENV,
  BACKEND_URL,
  FE_SUBDIRECTORY,
  FE_BUILD_DIR,
  FE_INSTANCE_SOURCE_DIR,
  SENTRY_DSN,
};