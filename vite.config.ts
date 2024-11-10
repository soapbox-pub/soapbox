/// <reference types="vitest/config" />
import fs from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

import react from '@vitejs/plugin-react-swc';
import { visualizer } from 'rollup-plugin-visualizer';
import { Connect, defineConfig, Plugin, UserConfig } from 'vite';
import checker from 'vite-plugin-checker';
import compileTime from 'vite-plugin-compile-time';
import { createHtmlPlugin } from 'vite-plugin-html';
import { VitePWA } from 'vite-plugin-pwa';
import { viteStaticCopy } from 'vite-plugin-static-copy';

const { NODE_ENV, PORT } = process.env;

export default defineConfig(() => {
  const config: UserConfig = {
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
      port: Number(PORT ?? 3036),
    },
    plugins: [
      checker({ typescript: true }),
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
            csp: buildCSP(NODE_ENV),
          },
        },
      }),
      react(),
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
          src: './node_modules/@twemoji/svg/*',
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
      }) as Plugin,
      {
        // Vite's default behavior is to serve index.html (HTTP 200) for unmatched routes, like a PWA.
        // Instead, 404 on known backend routes to more closely match a real server.
        name: 'vite-mastodon-dev',
        configureServer(server) {
          const notFoundHandler: Connect.SimpleHandleFunction = (_req, res) => {
            res.statusCode = 404;
            res.end();
          };

          server.middlewares.use('/api/', notFoundHandler);
          server.middlewares.use('/oauth/', notFoundHandler);
          server.middlewares.use('/nodeinfo/', notFoundHandler);
          server.middlewares.use('/.well-known/', notFoundHandler);
        },
      },
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
  };

  return config;
});

/** Build a sane default CSP string to embed in index.html in case the server doesn't return one. */
/* eslint-disable quotes */
function buildCSP(env: string | undefined): string {
  const csp = [
    "default-src 'none'",
    "script-src 'self' 'wasm-unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "frame-src 'self' https:",
    "font-src 'self'",
    "base-uri 'self'",
    "manifest-src 'self'",
  ];

  if (env === 'development') {
    csp.push(
      "connect-src 'self' blob: https: wss: http://localhost:* http://127.0.0.1:* ws://localhost:* ws://127.0.0.1:*",
      "img-src 'self' data: blob: https: http://localhost:* http://127.0.0.1:*",
      "media-src 'self' https: http://localhost:* http://127.0.0.1:*",
    );
  } else {
    csp.push(
      "connect-src 'self' blob: https: wss:",
      "img-src 'self' data: blob: https:",
      "media-src 'self' https:",
    );
  }

  return csp.join('; ');
}
/* eslint-enable quotes */

/** Return file as string, or return empty string if the file isn't found. */
function readFileContents(path: string) {
  try {
    return fs.readFileSync(path, 'utf8');
  } catch {
    return '';
  }
}
