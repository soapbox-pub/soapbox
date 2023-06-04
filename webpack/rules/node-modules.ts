import { join } from 'path';

import { env, settings } from '../configuration';

import type { RuleSetRule } from 'webpack';

const rule: RuleSetRule = {
  test: /\.(js|mjs)$/,
  include: /node_modules/,
  exclude: [
    /@babel(?:\/|\\{1,2})runtime/,
    /\bcore-js\b/,
    /\bwebpack\/buildin\b/,
  ],
  use: [
    {
      loader: 'babel-loader',
      options: {
        babelrc: false,
        cacheDirectory: join(settings.cache_path, 'babel-loader-node-modules'),
        cacheCompression: env.NODE_ENV === 'production',
        compact: false,
        sourceMaps: false,
      },
    },
  ],
};

export default rule;