import { resolve } from 'path';

import type { RuleSetRule } from 'webpack';

/** Recompile code.js whenever git changes. */
const rule: RuleSetRule = {
  test: resolve(__dirname, '../../app/soapbox/utils/code.js'),
  use: {
    loader: resolve(__dirname, '../loaders/git-loader.ts'),
  },
};

export default rule;