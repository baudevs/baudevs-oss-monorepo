/// <reference types='vitest' />
import { defineConfig } from 'vite';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';
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
  server: {
    port: 4200,
    host: 'localhost',
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
    nxCopyAssetsPlugin(['*.md']),
  ],
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },
  build: {
    outDir: '../../dist/apps/baudevs-dashboard',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});
