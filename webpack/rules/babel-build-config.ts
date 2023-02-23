import { resolve } from 'path';

import { env } from '../configuration';

import type { RuleSetRule } from 'webpack';

// This is a hack, used to force build-config @preval to recompile
// https://github.com/kentcdodds/babel-plugin-preval/issues/19

const rule: RuleSetRule = {
  test: resolve(__dirname, '../../app/soapbox/build-config.js'),
  use: [
    {
      loader: 'babel-loader',
      options: {
        cacheDirectory: false,
        cacheCompression: env.NODE_ENV === 'production',
        compact: env.NODE_ENV === 'production',
      },
    },
  ],
};

export default rule;
