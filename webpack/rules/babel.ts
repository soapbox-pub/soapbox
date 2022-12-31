import { join, resolve } from 'path';

import { env, settings } from '../configuration';

import type { RuleSetRule } from 'webpack';

const rule: RuleSetRule = {
  test: /\.(js|jsx|mjs|ts|tsx)$/,
  include: [
    settings.source_path,
    ...settings.resolved_paths,
  ].map(p => resolve(p)),
  exclude: /node_modules/,
  use: [
    {
      loader: 'ts-loader',
      options: {
        // disable type checker - we will use it in fork plugin
        transpileOnly: true,
      },
    },
    {
      loader: 'babel-loader',
      options: {
        cacheDirectory: join(settings.cache_path, 'babel-loader'),
        cacheCompression: env.NODE_ENV === 'production',
        compact: env.NODE_ENV === 'production',
        plugins: [
          'react-refresh/babel',
        ],
      },
    },
  ],
};

export default rule;