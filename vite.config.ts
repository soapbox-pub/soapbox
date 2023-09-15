import path from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import compileTime from 'vite-plugin-compile-time';
import { createHtmlPlugin } from 'vite-plugin-html';
import { VitePWA } from 'vite-plugin-pwa';
import vitePluginRequire from 'vite-plugin-require';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  root: 'app',
  build: {
    // Relative to the root
    outDir: '../static',
    assetsDir: 'packs',
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        assetFileNames: 'packs/assets/[name]-[hash].[ext]',
        chunkFileNames: 'packs/js/[name]-[hash].js',
        entryFileNames: 'packs/[name]-[hash].js',
      },
    },
  },
  server: {
    port: 3036,
  },
  plugins: [
    // @ts-ignore
    vitePluginRequire.default(),
    compileTime(),
    createHtmlPlugin({
      template: 'index.html',
    }),
    react({
      // Use React plugin in all *.jsx and *.tsx files
      include: '**/*.{jsx,tsx}',
      babel: {
        configFile: './babel.config.cjs',
      },
    }),
    VitePWA({
      injectRegister: null,
      strategies: 'injectManifest',
      injectManifest: {
        injectionPoint: undefined,
        plugins: [
          // @ts-ignore
          compileTime(),
        ],
      },
      manifestFilename: 'manifest.json',
      manifest: {
        name: 'Soapbox',
        short_name: 'Soapbox',
        description: 'A social media frontend with a focus on custom branding and ease of use.',
      },
      srcDir: 'soapbox/service-worker',
      filename: 'sw.ts',
    }),
    viteStaticCopy({
      targets: [{
        src: '../node_modules/twemoji/assets/svg/*',
        dest: 'packs/emoji/',
      }],
    }),
  ],
  resolve: {
    alias: [
      { find: 'soapbox', replacement: path.resolve(__dirname, 'app', 'soapbox') },
      { find: 'assets', replacement: path.resolve(__dirname, 'app', 'assets') },
    ],
  },
  assetsInclude: ['**/*.oga'],
});