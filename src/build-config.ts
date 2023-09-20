import type { SoapboxEnv } from './build-config-compiletime';

export const {
  NODE_ENV,
  BACKEND_URL,
  FE_SUBDIRECTORY,
  FE_INSTANCE_SOURCE_DIR,
  SENTRY_DSN,
} = import.meta.compileTime<SoapboxEnv>('./build-config-compiletime.ts');
