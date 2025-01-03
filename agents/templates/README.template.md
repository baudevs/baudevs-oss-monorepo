# @baudevs/{{library-name}}

{{library-description}}

## Installation

```bash
pnpm add @baudevs/{{library-name}}
```

## Usage

```tsx
import {{ClassName}} from '@baudevs/{{library-name}}';

const tracker = new {{ClassName}}({
  endpoints: ['/api/test', /^https?:\/\/example\.com\/api\/order\/\d+$/],
  trackWebSocket: true,
});

tracker.activate();
```

## API

### **{{ClassName}}(options: RequestTrackerOptions)**

- options.endpoints: Array of strings or regular expressions to monitor.
- options.trackWebSocket: Boolean to enable WebSocket interception.

### Methods

- activate(): Activates the tracker.
- deactivate(): Deactivates the tracker.
- addEndpoint(pattern: string | RegExp): Adds a new endpoint to monitor.
- removeEndpoint(pattern: string | RegExp): Removes an existing endpoint.
- listEndpoints(): Lists all monitored endpoints.

**Example: Rollup Configuration Template**

```javascript
// rollup.config.js

import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'libs/{{library-name}}/src/lib/{{library-name}}.ts',
  output: [
    {
      file: 'libs/{{library-name}}/dist/{{library-name}}.cjs.js',
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: 'libs/{{library-name}}/dist/{{library-name}}.esm.js',
      format: 'esm',
      sourcemap: true,
    },
    {
      file: 'libs/{{library-name}}/dist/{{library-name}}.umd.min.js',
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
    typescript({ tsconfig: './libs/{{library-name}}/tsconfig.lib.json' }),
    terser(), // Minify the bundle
  ],
};
```
