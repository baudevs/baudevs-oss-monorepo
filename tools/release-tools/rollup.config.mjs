import { withNx } from '@nx/rollup/with-nx.js';
import terser from '@rollup/plugin-terser';
import gzipPlugin from 'rollup-plugin-gzip';

// Check if we're in CI environment
const isCI = process.env.CI === 'true';

export default withNx(
  {
    main: 'tools/release-tools/src/index.ts',
    outputPath: 'dist/tools/@baudevs/release-tools',
    tsConfig: 'tools/release-tools/tsconfig.lib.json',
    compiler: 'babel',
    deleteOutputPath: true,
    format: ['esm', 'cjs', 'umd'],
    assets: [{ input: 'tools/release-tools', output: '.', glob: '*.md' }],
  },
  {
    output: {
      name: 'ReleaseTools',
      sourcemap: true,
      plugins: [terser()],
      globals: {
        '@baudevs/release-tools': 'ReleaseTools',
      },
    },
    external: [],
    plugins: [
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
