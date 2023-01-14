// Asset modules
// https://webpack.js.org/guides/asset-modules/

import { resolve } from 'path';

import type { RuleSetRule } from 'webpack';

// These are processed in reverse-order
// We use the name 'packs' instead of 'assets' for legacy reasons
const rules: RuleSetRule[] = [{
  test: /\.(png|svg)/,
  type: 'asset/resource',
  include: [
    resolve('app', 'assets', 'images'),
    resolve('node_modules', 'emoji-datasource'),
    resolve('node_modules', 'leaflet'),
  ],
  generator: {
    filename: 'packs/images/[name]-[contenthash:8][ext]',
  },
}, {
  test: /\.(ttf|eot|svg|woff|woff2)/,
  type: 'asset/resource',
  include: [
    resolve('app', 'assets', 'fonts'),
    resolve('node_modules', 'fork-awesome'),
    resolve('node_modules', 'line-awesome'),
    resolve('node_modules', '@fontsource'),
  ],
  generator: {
    filename: 'packs/fonts/[name]-[contenthash:8][ext]',
  },
}, {
  test: /\.(ogg|oga|mp3)/,
  type: 'asset/resource',
  include: resolve('app', 'assets', 'sounds'),
  generator: {
    filename: 'packs/sounds/[name]-[contenthash:8][ext]',
  },
}, {
  test: /\.svg$/,
  type: 'asset/resource',
  include: resolve('node_modules', 'twemoji'),
  generator: {
    filename: 'packs/emoji/[name]-[contenthash:8][ext]',
  },
}, {
  test: /\.svg$/,
  type: 'asset/resource',
  include: resolve('app', 'assets', 'icons'),
  generator: {
    filename: 'packs/icons/[name]-[contenthash:8][ext]',
  },
}, {
  test: /\.svg$/,
  type: 'asset/resource',
  include: resolve('node_modules', 'bootstrap-icons'),
  generator: {
    filename: 'packs/icons/[name]-[contenthash:8][ext]',
  },
}, {
  test: /\.svg$/,
  type: 'asset/resource',
  include: [
    resolve('node_modules', '@tabler'),
    resolve('custom', 'modules', '@tabler'),
  ],
  generator: {
    filename: 'packs/icons/[name]-[contenthash:8][ext]',
  },
}, {
  test: /\.svg$/,
  type: 'asset/resource',
  include: resolve('node_modules', 'cryptocurrency-icons'),
  generator: {
    filename: 'packs/images/crypto/[name]-[contenthash:8][ext]',
  },
}];

export default rules;
