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
const fsPromises = require('fs').promises;


const tempDistDir = '.temp-dist';
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
 * Process tsconfig and its extends chain
 * @param {string} projectDir - The path to the project directory
 * @param {string} workspaceRoot - The path to the workspace root directory
 * @returns {string} The path to the processed tsconfig file
 */
async function processConfigFile(projectDir, workspaceRoot) {
  try {
    const files = await fsPromises.readdir(projectDir);
    const tsconfigFiles = files.filter(file => file.startsWith('tsconfig') && file.endsWith('.json'));
    for (const file of tsconfigFiles) {
    const configPath = path.join(projectDir, file);
    const content = await fsPromises.readFile(configPath, 'utf8');
    const processedContent = content.replace(/{workspaceRoot}/g, workspaceRoot);

    if (content !== processedContent) {
      // Rename the original file
      const originalConfigPath = `${configPath}.original`;
      await fsPromises.rename(configPath, originalConfigPath);

        // Write the processed content to the original file path
        await fsPromises.writeFile(configPath, processedContent, 'utf8');
      }
    }
  } catch (error) {
    console.error('Error processing tsconfig files:', error);
    return false;
  }
  return true
}

/**
 * Cleanup the processed tsconfig files
 * @param {string} projectDir - The path to the project directory
 */
async function cleanupConfigFiles(projectDir) {
  const files = await fsPromises.readdir(projectDir);
  const tsconfigFiles = files.filter(file => file.startsWith('tsconfig') && file.endsWith('.json.original'));

  for (const file of tsconfigFiles) {
    const originalConfigPath = path.join(projectDir, file);
    const configPath = originalConfigPath.replace('.original', '');

    // Delete the processed config file
    await fsPromises.unlink(configPath);

    // Rename the original file back to its original name
    await fsPromises.rename(originalConfigPath, configPath);
  }
}

/**
 * Process tsconfig paths replacing {workspaceRoot} with actual path
 * @param {string} tsConfigPath - The path to tsconfig
 * @returns {string} The processed tsconfig path
 */
async function processTsConfigFiles(tsConfigPath, workspaceRoot) {
  const projectDir = path.dirname(tsConfigPath);
  const result = await processConfigFile(projectDir, workspaceRoot);
  if (!result) {
    throw new Error('Failed to process tsconfig files');
  }
  return result;
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
async function withCustomNX(options) {
  const {
    input,
    outputPath,
    formats = ['esm', 'cjs'],
    tsConfig,
    assets = [],
    external = [],
    generateBundleAnalysis = false,
  } = options;

  const workspaceRoot = resolveWorkspaceRoot();
  const isCI = process.env.CI === 'true';
  const projectDir = path.dirname(tsConfig);
  const finalOutputPath = path.join(workspaceRoot, 'dist', outputPath);

  return {
    input,
    output: formats.map((format) => ({
      dir: finalOutputPath,
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
      // Process tsconfig files before build starts
      {
        name: 'process-tsconfig',
        async buildStart() {
          const processedTsConfig = await processTsConfigFiles(tsConfig, workspaceRoot);
          if (!processedTsConfig) {
            throw new Error('Failed to process tsconfig files');
          }
        }
      },
      // Clean output directory plugin
      {
        name: 'clean-output',
        buildStart: async () => {
          if (existsSync(finalOutputPath)) {
            try {
              await fsPromises.rm(finalOutputPath, { recursive: true, force: true });
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
        tsconfig: tsConfig, // we use the original tsconfig file because we already to replace the {workspaceRoot} with the actual path and saved a backup as tsconfig.lib.json.original
        outDir: finalOutputPath,
        sourceMap: true,
        inlineSources: true,
        declaration: true,
        declarationDir: path.join(finalOutputPath, 'types'),
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
        extract: path.join(finalOutputPath, 'styles.css'),
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
        filter: (file) => file.endsWith('umd.js'),
      }),

      // Copy Plugin for Asset Management
      copy({
        targets: [
          // First copy the assets to the temp directory
          ...assets.map((asset) => ({
            src: asset.glob.startsWith('/') ? asset.glob : path.join('src', asset.glob),
            dest: finalOutputPath,
            flatten: false,
          })),
        ],
      }),

      // Optional: Bundle Analysis
      generateBundleAnalysis && analyze({
        summaryOnly: true,
      }),

      // Cleanup hook
      {
        name: 'cleanup-temp',
        buildEnd: {
          sequential: true,
          order: 'post',
          async handler(error) {
            try {
              await cleanupConfigFiles(path.dirname(tsConfig));
              console.log('✅ Restored tsconfig files');
            } catch (cleanupError) {
              console.error('❌ Error cleaning up tsconfig files:', cleanupError);
              // If there was an original error, we want to throw that instead
              if (error) throw error;
              // Otherwise throw the cleanup error
              throw cleanupError;
            }
          }
        },
        // Add a second hook to ensure cleanup runs even if build fails
        buildError: {
          sequential: true,
          order: 'post',
          async handler(error) {
            try {
              await cleanupConfigFiles(path.dirname(tsConfig));
              console.log('✅ Restored tsconfig files after error');
            } catch (cleanupError) {
              console.error('❌ Error cleaning up tsconfig files after build error:', cleanupError);
              // Always throw the original error in this case
              throw error;
            }
          }
        }
      }
    ].filter(Boolean),
  };
}

module.exports = { withCustomNX, resolveWorkspaceRoot };
