// Note: You must restart bin/webpack-dev-server for changes to take effect
console.log('Running in development mode'); // eslint-disable-line no-console

import { join } from 'path';

import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import { merge } from 'webpack-merge';

import sharedConfig from './shared';

import type { Configuration } from 'webpack';
import type { Configuration as DevServerConfiguration, ProxyConfigMap } from 'webpack-dev-server';

const watchOptions: Configuration['watchOptions'] = {};

const {
  DEVSERVER_URL,
  BACKEND_URL,
  PATRON_URL,
  PROXY_HTTPS_INSECURE,
} = process.env;

const DEFAULTS = {
  DEVSERVER_URL: 'http://localhost:3036',
  PATRON_URL: 'http://localhost:3037',
};

const { FE_SUBDIRECTORY } = require(join(__dirname, '..', 'app', 'soapbox', 'build-config'));

const backendEndpoints = [
  '/api',
  '/pleroma',
  '/nodeinfo',
  '/socket',
  '/oauth',
  '/.well-known/webfinger',
  '/static',
  '/main/ostatus',
  '/ostatus_subscribe',
  '/favicon.png',
];

const makeProxyConfig = (): ProxyConfigMap => {
  const secureProxy = PROXY_HTTPS_INSECURE !== 'true';

  const proxyConfig: ProxyConfigMap = {};
  proxyConfig['/api/patron'] = {
    target: PATRON_URL || DEFAULTS.PATRON_URL,
    secure: secureProxy,
    changeOrigin: true,
  };
  backendEndpoints.map(endpoint => {
    proxyConfig[endpoint] = {
      target: BACKEND_URL,
      secure: secureProxy,
      changeOrigin: true,
    };
  });
  return proxyConfig;
};

if (process.env.VAGRANT) {
  // If we are in Vagrant, we can't rely on inotify to update us with changed
  // files, so we must poll instead. Here, we poll every second to see if
  // anything has changed.
  watchOptions.poll = 1000;
}

const devServerUrl = (() => {
  try {
    return new URL(DEVSERVER_URL || DEFAULTS.DEVSERVER_URL);
  } catch {
    return new URL(DEFAULTS.DEVSERVER_URL);
  }
})();

const devServer: DevServerConfiguration = {
  compress: true,
  host: devServerUrl.hostname,
  port: devServerUrl.port,
  https: devServerUrl.protocol === 'https:',
  hot: true,
  allowedHosts: 'all',
  historyApiFallback: {
    disableDotRule: true,
    index: join(FE_SUBDIRECTORY, '/'),
  },
  headers: {
    'Access-Control-Allow-Origin': '*',
  },
  client: {
    overlay: true,
  },
  static: {
    serveIndex: true,
  },
  proxy: makeProxyConfig(),
};

const configuration: Configuration = {
  mode: 'development',
  cache: true,
  devtool: 'source-map',

  stats: {
    preset: 'errors-warnings',
    errorDetails: true,
  },

  output: {
    pathinfo: true,
  },

  watchOptions: Object.assign(
    {},
    { ignored: '**/node_modules/**' },
    watchOptions,
  ),

  plugins: [
    new ReactRefreshWebpackPlugin(),
  ],

  devServer,
};

export default merge<Configuration>(sharedConfig, configuration);
