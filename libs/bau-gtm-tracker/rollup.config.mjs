import { withNx } from '@nx/rollup/with-nx.js';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import swc from '@rollup/plugin-swc';
import terser from '@rollup/plugin-terser';
import gzipPlugin from 'rollup-plugin-gzip';

// Check if we're in CI environment
const isCI = process.env.CI === 'true';

export default withNx(
  {
    main: 'libs/bau-gtm-tracker/src/index.ts',
    outputPath: 'dist/libs/@baudevs/bau-gtm-tracker',
    tsConfig: 'libs/bau-gtm-tracker/tsconfig.lib.json',
    compiler: 'babel',
    deleteOutputPath: true,
    format: ['esm', 'cjs', 'umd'],
    assets: [{ input: 'libs/bau-gtm-tracker', output: '.', glob: '*.md' }],
  },
  {
    output: {
      name: 'BauGtmTracker',
      sourcemap: true,
      plugins: [terser()],
      globals: {
        '@baudevs/bau-gtm-tracker': 'BauGtmTracker',
      },
    },
    external: [],
    plugins: [
      nodeResolve(),
      commonjs(),
      swc(),
      terser({
        compress: {
          ecma: 2020,
          booleans_as_integers: true,
          ...isCI && {
            pure_funcs: ['console.log', 'console.debug'],
            drop_console: ['debug', 'log'],
          },
        },
        format: {
          comments: false,
        },
      }),
      gzipPlugin({
        filter: (file) => file.endsWith('.umd.js'),
      }),
    ],
  },
);
