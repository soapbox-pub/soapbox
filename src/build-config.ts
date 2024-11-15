import type { SoapboxEnv } from './build-config-compiletime.ts';

export const {
  NODE_ENV,
  BACKEND_URL,
  FE_INSTANCE_SOURCE_DIR,
  SENTRY_DSN,
} = import.meta.compileTime<SoapboxEnv>('./build-config-compiletime.ts');
