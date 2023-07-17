// Note: You must restart bin/webpack-dev-server for changes to take effect

import fs from 'fs';
import { join, resolve } from 'path';

import CopyPlugin from 'copy-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import HtmlWebpackHarddiskPlugin from 'html-webpack-harddisk-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import webpack, { Configuration } from 'webpack';
import AssetsManifestPlugin from 'webpack-assets-manifest';
import DeadCodePlugin from 'webpack-deadcode-plugin';

import { env, settings, output } from './configuration';
import rules from './rules';

const { FE_SUBDIRECTORY, FE_INSTANCE_SOURCE_DIR } = require(join(__dirname, '..', 'app', 'soapbox', 'build-config'));

/** Return file as string, or return empty string. */
const readFile = (filename: string) => {
  try {
    return fs.readFileSync(filename, 'utf8');
  } catch {
    return '';
  }
};

const makeHtmlConfig = (params = {}): HtmlWebpackPlugin.Options => {
  const defaults: HtmlWebpackPlugin.Options = {
    template: 'app/index.ejs',
    chunksSortMode: 'manual',
    chunks: ['common', 'locale_en', 'application', 'styles'],
    alwaysWriteToDisk: true,
    minify: {
      collapseWhitespace: true,
      removeComments: false,
      removeRedundantAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      useShortDoctype: true,
    },
    templateParameters: {
      snippets: readFile(resolve('custom/snippets.html')),
    },
  };

  return Object.assign(defaults, params);
};

const configuration: Configuration = {
  entry: {
    application: resolve('app/soapbox/main.tsx'),
  },

  output: {
    filename: 'packs/js/[name].js',
    chunkFilename: 'packs/js/[name].chunk.js',
    hotUpdateChunkFilename: 'packs/js/[id].hot-update.js',
    path: output.path,
    publicPath: FE_SUBDIRECTORY || '/',
  },

  optimization: {
    chunkIds: 'total-size',
    moduleIds: 'size',
    runtimeChunk: {
      name: 'common',
    },
    splitChunks: {
      cacheGroups: {
        default: false,
        defaultVendors: false,
        common: {
          name: 'common',
          chunks: 'all',
          minChunks: 2,
          minSize: 0,
          test: /^(?!.*[\\\/]node_modules[\\\/]react-intl[\\\/]).+$/,
        },
      },
    },
  },

  module: {
    rules,
  },

  plugins: [
    new webpack.EnvironmentPlugin(JSON.parse(JSON.stringify(env))),
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
    new ForkTsCheckerWebpackPlugin({ typescript: { memoryLimit: 8192 } }),
    new MiniCssExtractPlugin({
      filename: 'packs/css/[name]-[contenthash:8].css',
      chunkFilename: 'packs/css/[name]-[contenthash:8].chunk.css',
    }),
    // @ts-ignore
    new AssetsManifestPlugin({
      integrity: false,
      entrypoints: true,
      writeToDisk: true,
      publicPath: true,
    }),
    // https://github.com/MQuy/webpack-deadcode-plugin
    // @ts-ignore
    new DeadCodePlugin({
      patterns: [
        'app/**/*',
      ],
      exclude: [
        '**/*.test.*',
        '**/__*__/*',
        '**/(LICENSE|README|COPYING)(.md|.txt)?',
        // This file is imported with @preval
        'app/soapbox/features/emoji/emoji-map.json',
      ],
    }),
    // https://github.com/jantimon/html-webpack-plugin#options
    new HtmlWebpackPlugin(makeHtmlConfig()),
    new HtmlWebpackPlugin(makeHtmlConfig({ filename: '404.html' })),
    new HtmlWebpackHarddiskPlugin(),
    new CopyPlugin({
      patterns: [{
        from: join(__dirname, '../node_modules/twemoji/assets/svg'),
        to: join(output.path, 'packs/emoji'),
      }, {
        from: join(__dirname, '..', 'app', FE_INSTANCE_SOURCE_DIR),
        to: join(output.path, 'instance'),
      }, {
        from: join(__dirname, '../custom/instance'),
        to: join(output.path, 'instance'),
        noErrorOnMissing: true,
        globOptions: {
          ignore: ['**/.gitkeep'],
        },
      }],
      options: {
        concurrency: 100,
      },
    }),
  ],

  resolve: {
    extensions: settings.extensions,
    modules: [
      resolve('custom', 'modules'),
      resolve(settings.source_path),
      'node_modules',
    ],
    alias: {
      'classnames': 'clsx',
      'icons': resolve('app', 'icons'),
      'custom': resolve('custom'),
    },
    fallback: {
      path: require.resolve('path-browserify'),
      util: require.resolve('util'),
      // https://github.com/facebook/react/issues/20235#issuecomment-1061708958
      'react/jsx-runtime': 'react/jsx-runtime.js',
      'react/jsx-dev-runtime': 'react/jsx-dev-runtime.js',
    },
  },

  resolveLoader: {
    modules: ['node_modules'],
  },
};

export default configuration;
