import { join } from 'path';
import { env } from 'process';

const {
  FE_SUBDIRECTORY,
  FE_BUILD_DIR,
} = require(join(__dirname, '..', 'app', 'soapbox', 'build-config'));

const settings = {
  source_path: 'app',
  public_root_path: FE_BUILD_DIR,
  test_root_path: `${FE_BUILD_DIR}-test`,
  cache_path: 'tmp/cache',
  resolved_paths: [],
  extensions: [ '.js', '.jsx', '.cjs', '.mjs', '.ts', '.tsx', '.sass', '.scss', '.css', '.module.sass', '.module.scss', '.module.css', '.png', '.svg', '.gif', '.jpeg', '.jpg' ],
};

const outputDir = env.NODE_ENV === 'test' ? settings.test_root_path : settings.public_root_path;

const output = {
  path: join(__dirname, '..', outputDir, FE_SUBDIRECTORY),
};

const exportEnv = {
  NODE_ENV: env.NODE_ENV,
};

export {
  settings,
  exportEnv as env,
  output,
};
