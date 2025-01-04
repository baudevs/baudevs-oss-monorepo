const { withNx } = require('@nx/rollup/with-nx');
const resolve = require('@rollup/plugin-node-resolve').default;
const commonjs = require('@rollup/plugin-commonjs');
const swc = require('@rollup/plugin-swc');
const terser = require('@rollup/plugin-terser');
module.exports = withNx(
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
    // Provide additional rollup configuration here. See: https://rollupjs.org/configuration-options
    // e.g.
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
      resolve(),
      commonjs(),
      swc(),
      terser(),
    ],
  },
);
