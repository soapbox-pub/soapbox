// Note: You must restart bin/webpack-dev-server for changes to take effect
console.log('Running in test mode'); // eslint-disable-line no-console

import { merge } from 'webpack-merge';

import sharedConfig from './shared';

import type { Configuration } from 'webpack';

const configuration: Configuration = {
  mode: 'development',
};

export default merge<Configuration>(sharedConfig, configuration);
