import { env } from 'process';

import type { RuleSetRule } from 'webpack';

let rule: RuleSetRule = {};

if (env.NODE_ENV !== 'production') {
  rule = {
    test: /\.js$/,
    loader: 'mark-loader',
  };
}

export default rule;