import path from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import compileTime from 'vite-plugin-compile-time';
import { createHtmlPlugin } from 'vite-plugin-html';
import vitePluginRequire from 'vite-plugin-require';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  root: 'app',
  build: {
    // Relative to the root
    outDir: '../static',
    assetsDir: 'packs',
  },
  plugins: [
    // @ts-ignore
    vitePluginRequire.default(),
    createHtmlPlugin({
      template: 'index.html',
    }),
    react({
      // Use React plugin in all *.jsx and *.tsx files
      include: '**/*.{jsx,tsx}',
      // babel: {
      //   configFile: './babel.config.cjs',
      // },
    }),
    compileTime(),
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