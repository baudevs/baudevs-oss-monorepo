# **Rollup Configuration Template**

```javascript
// rollup.config.js

import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/lib/{{library-name}}.ts',
  output: [
    {
      file: 'dist/{{library-name}}.cjs.js',
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: 'dist/{{library-name}}.esm.js',
      format: 'esm',
      sourcemap: true,
    },
    {
      file: 'dist/{{library-name}}.umd.min.js',
      format: 'umd',
      name: '{{LibraryName}}',
      sourcemap: true,
      plugins: [terser()],
    },
  ],
  external: [],
  plugins: [
    resolve(),
    commonjs(),
    typescript({ tsconfig: './tsconfig.lib.json' }),
    terser(), // Minify the bundle
  ],
};
```
