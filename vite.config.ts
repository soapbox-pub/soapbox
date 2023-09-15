import path from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';
import compileTime from 'vite-plugin-compile-time';
import { createHtmlPlugin } from 'vite-plugin-html';
import vitePluginRequire from 'vite-plugin-require';
import { viteStaticCopy } from 'vite-plugin-static-copy';

const removeExportsPlugin: Plugin = {
  name: 'remove-sw-exports',
  generateBundle(_options, bundle) {
    for (const [name, chunk] of Object.entries(bundle)) {
      if (chunk.type === 'chunk' && name === 'sw.js') {
        chunk.code = chunk.code.replace(/export{.*};\s*$/g, '');
      }
    }
  },
};

export default defineConfig({
  root: 'app',
  build: {
    outDir: '../static',
    assetsDir: 'packs',
    assetsInlineLimit: 0,
    rollupOptions: {
      input: {
        main: 'app/index.html',
        sw: 'app/soapbox/service-worker/sw.ts',
      },
      output: {
        entryFileNames: ({ name }) => {
          switch (name) {
            case 'sw':
              return 'sw.js';
            default:
              return 'packs/[name]-[hash].js';
          }
        },
        manualChunks: (id) => {
          if (id.includes('soapbox/service-worker')) {
            return 'sw';
          }
          return 'main';
        },
        assetFileNames: 'packs/assets/[name]-[hash].[ext]',
        chunkFileNames: 'packs/js/[name]-[hash].js',
      },
    },
  },
  server: {
    port: 3036,
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
      babel: {
        configFile: './babel.config.cjs',
      },
    }),
    compileTime(),
    viteStaticCopy({
      targets: [{
        src: '../node_modules/twemoji/assets/svg/*',
        dest: 'packs/emoji/',
      }],
    }),
    removeExportsPlugin,
  ],
  resolve: {
    alias: [
      { find: 'soapbox', replacement: path.resolve(__dirname, 'app', 'soapbox') },
      { find: 'assets', replacement: path.resolve(__dirname, 'app', 'assets') },
    ],
  },
  assetsInclude: ['**/*.oga'],
});