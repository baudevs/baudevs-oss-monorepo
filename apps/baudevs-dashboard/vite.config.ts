/// <reference types='vitest' />
import { defineConfig } from 'vite';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { aiSummaryHandler } from './src/api/ai-summary';
import type { IncomingMessage } from 'http';

interface AISummaryRequest {
  prompt: string;
}

interface ExtendedRequest extends IncomingMessage {
  body?: AISummaryRequest;
}

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/baudevs-dashboard',
  base: process.env.GITHUB_ACTIONS ? '/baudevs-monorepo/' : '/',

  build: {
    outDir: '../../dist/apps/baudevs-dashboard',
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },

  server: {
    port: 4200,
    host: 'localhost',
    fs: {
      strict: false,
    },
    middlewareMode: false,
  },

  preview: {
    port: 4300,
    host: 'localhost',
  },

  plugins: [
    {
      name: 'ai-summary-api',
      configureServer(server) {
        server.middlewares.use('/api/ai-summary', async (req: ExtendedRequest, res, next) => {
          if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => {
              body += chunk.toString();
            });
            req.on('end', () => {
              req.body = JSON.parse(body);
              aiSummaryHandler(req, res);
            });
          } else {
            next();
          }
        });
      },
    },
    nxViteTsPaths(),
  ],

  optimizeDeps: {
    include: ['@mui/material', '@emotion/react', '@emotion/styled'],
    exclude: [],
  },
});
