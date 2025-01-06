// libs/bauLogHero/rollup.config.mjs
import path from 'path';
import { fileURLToPath } from 'url';
import withCustomNxModule from '../../tools/rollup/withCustomNx.cjs';

const { withCustomNX } = withCustomNxModule;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default withCustomNX({
  input: path.resolve(__dirname, 'src/index.ts'),
  outputPath: '@baudevs/bau-log-hero',
  formats: ['esm', 'cjs'],
  tsConfig: path.resolve(__dirname, 'tsconfig.lib.json'),
  assets: [
    {
      glob: '**/*.md',
    },
  ],
  external: [
    'fs',
    'path',
    'os',
    /^@baudevs\/.*/  // This will make all @baudevs packages external
  ],
  generateBundleAnalysis: false,
});
