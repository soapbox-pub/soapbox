import path from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import compileTime from 'vite-plugin-compile-time';
import { createHtmlPlugin } from 'vite-plugin-html';
import vitePluginRequire from 'vite-plugin-require';

export default defineConfig({
  root: 'app',
  build: {
    // Relative to the root
    outDir: '../static',
  },
  plugins: [
    createHtmlPlugin({
      template: 'index.html',
    }),
    react({
      // Use React plugin in all *.jsx and *.tsx files
      include: '**/*.{jsx,tsx}',
    }),
    // @ts-ignore
    vitePluginRequire.default(),
    compileTime(),
  ],
  resolve: {
    alias: [
      { find: 'soapbox', replacement: path.resolve(__dirname, 'app', 'soapbox') },
      { find: 'assets', replacement: path.resolve(__dirname, 'app', 'assets') },
    ],
  },
  assetsInclude: ['**/*.oga'],
});