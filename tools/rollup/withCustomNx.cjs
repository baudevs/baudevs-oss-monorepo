// tools/rollup/withCustomNX.js
const path = require('path');
const { existsSync } = require('fs');
const copy = require('rollup-plugin-copy');
const json = require('@rollup/plugin-json');
const image = require('@rollup/plugin-image');
const postcss = require('rollup-plugin-postcss');
const autoprefixer = require('autoprefixer');
const commonjs = require('@rollup/plugin-commonjs');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const typescript = require('@rollup/plugin-typescript');
const babel = require('@rollup/plugin-babel');
const terser = require('@rollup/plugin-terser');
const gzip = require('rollup-plugin-gzip');
const alias = require('@rollup/plugin-alias');
const analyze = require('rollup-plugin-analyzer');
const fs = require('fs');

/**
 * Resolve the nx workspace root directory by searching for the nx.json file.
 * @param {string} basePath - The base path to start searching from.
 * @returns {string} The resolved workspace root directory.
 */
function resolveWorkspaceRoot(basePath = process.cwd()) {
  let workspaceRoot = path.resolve(basePath);
  let searchLevel = 0;
  while (!existsSync(path.join(workspaceRoot, 'nx.json')) && searchLevel < 10) {
    workspaceRoot = path.dirname(workspaceRoot);
    searchLevel++;
  }
  return workspaceRoot;
}

/**
 * Process tsconfig paths replacing {workspaceRoot} with actual path
 * @param {string} tsConfigPath - The path to tsconfig
 * @returns {string} The processed tsconfig path
 */
function processTsConfigPath(tsConfigPath) {
  const workspaceRoot = resolveWorkspaceRoot();
  return tsConfigPath.replace(/{workspaceRoot}/g, workspaceRoot);
}

/**
 * Custom Rollup configuration helper for NX monorepo.
 *
 * @param {Object} options - Configuration options.
 * @param {string} options.input - Entry file path.
 * @param {string} options.outputPath - Output directory path.
 * @param {Array<string>} options.formats - Output formats (e.g., ['esm', 'cjs']).
 * @param {string} options.tsConfig - Path to tsconfig file.
 * @param {Array<Object>} options.assets - Array of asset glob patterns.
 * @param {Array<string>} options.external - Array of external dependencies.
 * @param {boolean} options.generateBundleAnalysis - Flag to include bundle analysis.
 * @returns {Object} Rollup configuration object.
 */
function withCustomNX(options) {
  const {
    input,
    outputPath,
    formats = ['esm', 'cjs'],
    tsConfig,
    assets = [],
    external = [],
    generateBundleAnalysis = false,
  } = options;

  const processedTsConfig = processTsConfigPath(tsConfig);
  const workspaceRoot = resolveWorkspaceRoot();
  const isCI = process.env.CI === 'true';

  // Create build directories
  const projectDir = path.dirname(input);
  const tempBuildDir = path.join(projectDir, '.temp-dist');
  const finalOutputPath = path.join(workspaceRoot, 'dist', outputPath);

  return {
    input,
    output: formats.map((format) => ({
      dir: tempBuildDir,
      format,
      sourcemap: true,
      preserveModules: true,
      preserveModulesRoot: 'src',
      exports: 'named',
      entryFileNames: `[name].${format}.js`,
      chunkFileNames: `[name].${format}.js`,
    })),
    external: (id) => external.some((dep) => id === dep || id.startsWith(`${dep}/`)),
    plugins: [
      // Clean output directory plugin
      {
        name: 'clean-output',
        buildStart() {
          if (existsSync(finalOutputPath)) {
            try {
              fs.rmSync(finalOutputPath, { recursive: true, force: true });
              console.log(`Cleaned output directory: ${finalOutputPath}`);
            } catch (error) {
              console.warn(`Warning: Could not clean ${finalOutputPath}:`, error);
            }
          }
        }
      },

      // Alias Plugin (before typescript)
      alias({
        entries: [
          {
            find: new RegExp(`^${outputPath}$`),
            replacement: path.resolve(projectDir, 'src/index.ts'),
          },
        ],
      }),

      // TypeScript Plugin
      typescript({
        tsconfig: processedTsConfig,
        outDir: tempBuildDir,
        sourceMap: true,
        inlineSources: true,
        declaration: true,
        declarationDir: path.join(tempBuildDir, 'types'),
        emitDeclarationOnly: false,
      }),

      // Node Resolve Plugin
      nodeResolve({
        browser: true,
        preferBuiltins: false,
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      }),

      // CommonJS Plugin
      commonjs(),

      // JSON Plugin
      json(),

      // Image Plugin
      image(),

      // PostCSS Plugin
      postcss({
        inject: true,
        extract: path.join(tempBuildDir, 'styles.css'),
        modules: true,
        plugins: [autoprefixer()],
        use: {
          less: {
            javascriptEnabled: true,
          },
        },
      }),

      // Babel Plugin
      babel({
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        babelHelpers: 'bundled',
        exclude: 'node_modules/**',
        presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'],
      }),

      // Terser Plugin for Minification
      terser({
        compress: {
          ecma: 2020,
          booleans_as_integers: true,
          ...(isCI && {
            pure_funcs: ['console.log', 'console.debug'],
            drop_console: ['debug', 'log'],
          }),
        },
        format: {
          comments: false,
        },
      }),

      // Gzip Plugin for Compression
      gzip.default({
        filter: (file) => file.endsWith('.js'),
      }),

      // Copy Plugin for Asset Management
      copy({
        targets: [
          // First copy the assets to the temp directory
          ...assets.map((asset) => ({
            src: asset.glob.startsWith('/') ? asset.glob : path.join('src', asset.glob),
            dest: tempBuildDir,
            flatten: false,
          })),
          // Then copy everything from temp directory to final output path
          {
            src: path.join(tempBuildDir, '**/*'),
            dest: finalOutputPath,
            hook: 'writeBundle'
          },
        ],
      }),

      // Optional: Bundle Analysis
      generateBundleAnalysis && analyze({
        summaryOnly: true,
      }),

      // Cleanup hook
      {
        name: 'cleanup-temp',
        closeBundle: {
          sequential: true,
          order: 'post',
          async handler() {
            // Clean up temp directory
            if (existsSync(tempBuildDir)) {
              try {
                fs.rmSync(tempBuildDir, { recursive: true, force: true });
                console.log(`Cleaned temporary directory: ${tempBuildDir}`);
              } catch (error) {
                console.warn(`Warning: Could not clean temporary directory ${tempBuildDir}:`, error);
              }
            }
          }
        }
      }
    ].filter(Boolean),
  };
}

module.exports = { withCustomNX, resolveWorkspaceRoot };
