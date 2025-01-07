# @baudevs/release-tools

A tool to analyze git changes and determine version bumps using OpenAI's API.

## Prerequisites

Before using this tool, ensure you have:

1. OpenAI API key set in your environment:

```bash
export OPENAI_API_KEY="your-key-here"
```

2. Required dependencies built:
   - `@baudevs/bau-log-hero` must be built in the workspace root's dist folder
   - OpenAI package installed in the workspace where you're running the tool

## Installation

```bash
# Install in your workspace
pnpm add @baudevs/release-tools

# Ensure OpenAI is installed (required as external dependency)
pnpm add openai
```

## Usage

The tool can be run in two modes:

### 1. Realtime Mode (Recommended)

Uses OpenAI's realtime API for faster analysis:

```bash
pnpm --filter @baudevs/release-tools run dev:realtime
```

### 2. Standard Mode

Uses regular OpenAI API:

```bash
pnpm --filter @baudevs/release-tools run dev
```

## Build Configuration

This package uses a custom Nx build configuration with Rollup:

### 1. Custom Nx Helper

We use a custom Nx helper (`withCustomNx`) that:

- Handles workspace path replacements
- Manages external dependencies
- Configures Rollup for ESM output

Location: `tools/rollup/withCustomNx.cjs`:

```javascript
// Example of key functionality:
const withCustomNX = (config) => ({
  ...config,
  output: {
    ...config.output,
    // Replace {workspaceRoot} in paths
    dir: config.outputPath.replace('{workspaceRoot}', process.cwd()),
  },
  // ... other customizations
});
```

### 2. Build Output

The build process:

- Generates ESM modules by default
- Replaces workspace paths in the output
- Handles external dependencies properly
- Creates both ESM and CJS bundles

### 3. Workspace Path Replacement

The build system automatically replaces:

- `{workspaceRoot}` with the actual workspace path
- Handles relative paths for dependencies
- Manages workspace-local package references

## Development

When developing:

1. Build dependencies first:

```bash
# Build bauLogHero (required dependency)
pnpm nx build @baudevs/bau-log-hero
```

2. Run in development mode:

```bash
# Use realtime mode for faster feedback
pnpm --filter @baudevs/release-tools run dev:realtime
```

3. Build for production:

```bash
pnpm nx build @baudevs/release-tools
```

## Architecture

The tool:

1. Analyzes git diff between branches
2. Filters out irrelevant files (tests, docs, etc.)
3. Sends the diff to OpenAI for analysis
4. Returns suggested version bump (patch/minor/major)

## Dependencies

- `@baudevs/bau-log-hero`: For structured logging
- `openai`: For AI analysis (external dependency)
- `ws`: For realtime API communication
- `minimatch`: For file pattern matching

## Important Notes

1. ESM Configuration:
   - Built as ESM modules
   - Uses `type: "module"` in package.json
   - Requires ESM-compatible imports

2. External Dependencies:
   - OpenAI must be installed separately
   - bauLogHero must be built in dist

3. Path Resolution:
   - Uses workspace-relative paths
   - Handles {workspaceRoot} replacement
   - Maintains monorepo structure
