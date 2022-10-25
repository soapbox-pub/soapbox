import assets from './assets';
import babel from './babel';
import buildConfig from './babel-build-config';
import git from './babel-git';
import css from './css';
import gitRefresh from './git-refresh';
import nodeModules from './node-modules';

import type { RuleSetRule } from 'webpack';

// Webpack loaders are processed in reverse order
// https://webpack.js.org/concepts/loaders/#loader-features
const rules: RuleSetRule[] = [
  ...assets,
  css,
  nodeModules,
  babel,
  git,
  gitRefresh,
  buildConfig,
];

export default rules;
