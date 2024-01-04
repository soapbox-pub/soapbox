/// <reference types="vitest" />
import fs from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import compileTime from 'vite-plugin-compile-time';
import { createHtmlPlugin } from 'vite-plugin-html';
import { VitePWA } from 'vite-plugin-pwa';
import vitePluginRequire from 'vite-plugin-require';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig(({ command }) => ({
  build: {
    assetsDir: 'packs',
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        assetFileNames: 'packs/assets/[name]-[hash].[ext]',
        chunkFileNames: 'packs/js/[name]-[hash].js',
        entryFileNames: 'packs/[name]-[hash].js',
      },
    },
    sourcemap: true,
  },
  assetsInclude: ['**/*.oga'],
  server: {
    port: 3036,
  },
  optimizeDeps: {
    exclude: command === 'serve' ? ['@soapbox.pub/wasmboy'] : [],
  },
  plugins: [
    checker({ typescript: true }),
    // @ts-ignore
    vitePluginRequire.default(),
    compileTime(),
    createHtmlPlugin({
      template: 'index.html',
      minify: {
        collapseWhitespace: true,
        removeComments: false,
      },
      inject: {
        data: {
          snippets: readFileContents('custom/snippets.html'),
        },
      },
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
      srcDir: 'src/service-worker',
      filename: 'sw.ts',
    }),
    viteStaticCopy({
      targets: [{
        src: './node_modules/twemoji/assets/svg/*',
        dest: 'packs/emoji/',
      }, {
        src: './src/instance',
        dest: '.',
      }, {
        src: './custom/instance',
        dest: '.',
      }],
    }),
    visualizer({
      emitFile: true,
      filename: 'report.html',
      title: 'Soapbox Bundle',
    }),
  ],
  resolve: {
    alias: [
      { find: 'soapbox', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
    ],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: 'src/jest/test-setup.ts',
  },
}));

/** Return file as string, or return empty string if the file isn't found. */
function readFileContents(path: string) {
  try {
    return fs.readFileSync(path, 'utf8');
  } catch {
    return '';
  }
}
