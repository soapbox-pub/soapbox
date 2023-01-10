// Note: You must restart bin/webpack-dev-server for changes to take effect
console.log('Running in production mode'); // eslint-disable-line no-console

import { join } from 'path';

import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import { merge } from 'webpack-merge';
import WorkboxWebpackPlugin from 'workbox-webpack-plugin';

import sharedConfig from './shared';

import type { Configuration } from 'webpack';

const configuration: Configuration = {
  mode: 'production',
  devtool: 'source-map',
  stats: 'errors-warnings',
  bail: true,

  output: {
    filename: 'packs/js/[name]-[chunkhash].js',
    chunkFilename: 'packs/js/[name]-[chunkhash].chunk.js',
    hotUpdateChunkFilename: 'packs/js/[id]-[contenthash].hot-update.js',
  },

  optimization: {
    minimize: true,
  },

  plugins: [
    // Generates report.html
    // @ts-ignore
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
      logLevel: 'silent',
    }),
    new WorkboxWebpackPlugin.InjectManifest({
      swSrc: join(__dirname, '../app/soapbox/service-worker/entry.ts'),
      swDest: 'sw.js',
      exclude: [/.*/],
    }),
  ],
};

export default merge<Configuration>(sharedConfig, configuration);
