// Note: You must restart bin/webpack-dev-server for changes to take effect
console.log('Running in production mode'); // eslint-disable-line no-console

import { join } from 'path';

// @ts-ignore: No types available.
import OfflinePlugin from '@lcdp/offline-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import { merge } from 'webpack-merge';

import sharedConfig from './shared';

import type { Configuration } from 'webpack';

const { FE_SUBDIRECTORY } = require(join(__dirname, '..', 'app', 'soapbox', 'build-config'));
const joinPublicPath = (...paths: string[]) => join(FE_SUBDIRECTORY, ...paths);

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
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
      logLevel: 'silent',
    }),
    new OfflinePlugin({
      autoUpdate: true,
      responseStrategy: 'network-first',
      caches: {
        main: [':rest:'],
        additional: [
          ':externals:',
          'packs/images/32-*.png', // used in emoji-mart
          'packs/icons/*.svg',
        ],
        optional: [
          '**/locale_*.js', // don't fetch every locale; the user only needs one
          '**/*.chunk.js', // only cache chunks when needed
          '**/*.chunk.css',
          '**/*.woff2', // the user may have system-fonts enabled
          // images can be cached on-demand
          '**/*.png',
          '**/*.svg',
        ],
      },
      externals: [
        joinPublicPath('packs/emoji/1f602.svg'), // used for emoji picker dropdown

        // Default emoji reacts
        joinPublicPath('packs/emoji/1f44d.svg'), // Thumbs up
        joinPublicPath('packs/emoji/2764.svg'),  // Heart
        joinPublicPath('packs/emoji/1f606.svg'), // Laughing
        joinPublicPath('packs/emoji/1f62e.svg'), // Surprised
        joinPublicPath('packs/emoji/1f622.svg'), // Crying
        joinPublicPath('packs/emoji/1f629.svg'), // Weary
        joinPublicPath('packs/emoji/1f621.svg'), // Angry (Spinster)
      ],
      excludes: [
        '**/*.gz',
        '**/*.map',
        '**/*.LICENSE.txt',
        'stats.json',
        'report.html',
        'instance/**/*',
        // any browser that supports ServiceWorker will support woff2
        '**/*.eot',
        '**/*.ttf',
        '**/*-webfont-*.svg',
        '**/*.woff',
        // Sounds return a 206 causing sw.js to crash
        // https://stackoverflow.com/a/66335638
        '**/*.ogg',
        '**/*.oga',
        '**/*.mp3',
        '404.html',
        'assets-manifest.json',
        // It would be nice to serve these, but they bloat up sw.js
        'packs/images/crypto/**/*',
        'packs/emoji/**/*',
      ],
      ServiceWorker: {
        cacheName: 'soapbox',
        entry: join(__dirname, '../app/soapbox/service-worker/entry.ts'),
        events: true,
        minify: true,
      },
      cacheMaps: [{
        // NOTE: This function gets stringified by OfflinePlugin, so don't try
        // moving it anywhere else or making it depend on anything outside it!
        // https://github.com/NekR/offline-plugin/blob/master/docs/cache-maps.md
        match: (url: URL) => {
          const { pathname } = url;

          const backendRoutes = [
            '/.well-known',
            '/activities',
            '/admin',
            '/api',
            '/auth',
            '/inbox',
            '/instance',
            '/internal',
            '/main/ostatus',
            '/manifest.json',
            '/media',
            '/nodeinfo',
            '/oauth',
            '/objects',
            '/ostatus_subscribe',
            '/pghero',
            '/phoenix',
            '/pleroma',
            '/proxy',
            '/relay',
            '/sidekiq',
            '/socket',
            '/static',
            '/unsubscribe',
            '/images',
            '/favicon.ico',
            '/favicon.png',
            '/apple-touch-icon.png',
            '/browserconfig.xml',
            '/robots.txt',
            '/report.html',
          ];

          if (backendRoutes.some(path => pathname.startsWith(path)) || pathname.endsWith('/embed') || pathname.endsWith('.rss')) {
            return url;
          }
        },
        requestTypes: ['navigate'],
      }],
      safeToUseOptionalCaches: true,
    }),
  ],
};

export default merge<Configuration>(sharedConfig, configuration);
