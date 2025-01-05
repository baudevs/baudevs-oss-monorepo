import { withNx } from '@nx/rollup/with-nx.js';



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
      plugins: [],
      globals: {
        '@baudevs/release-tools': 'ReleaseTools',
      },
    },
    external: [],
    plugins: [
    ],
  },
);
