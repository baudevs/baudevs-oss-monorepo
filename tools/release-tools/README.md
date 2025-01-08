# @baudevs/release-tools

A tool to analyze git changes and determine version bumps using OpenAI's Realtime API.

## Prerequisites

Before using this tool, ensure you have:

1. OpenAI API key set in your environment:

```bash
export OPENAI_API_KEY="your-key-here"
```

2. Required dependencies built:
   - `@baudevs/bau-log-hero` must be built in the workspace root's dist folder
   - WebSocket (`ws`) package installed for realtime communication

## Installation

```bash
# Install in your workspace
pnpm add @baudevs/release-tools

# Ensure WebSocket is installed (required for realtime)
pnpm add ws
```

## Usage

The tool uses OpenAI's Realtime API for efficient analysis:

```typescript
import { analyzeGitDiffForVersion } from '@baudevs/release-tools';

const result = await analyzeGitDiffForVersion();
// Returns: { 
//   version_type: 'patch' | 'minor' | 'major' | 'unknown',
//   needs_review: boolean,
//   reasoning: string 
// }
```

## CLI Commands

The tool provides several CLI commands for version management:

### Version Analysis
```bash
pnpm tsx src/cli.ts analyze
```
Analyzes git changes to determine version bump type using OpenAI's Realtime API.
Returns: 
- version_type: major/minor/patch
- needs_review: whether human review is needed
- reasoning: detailed explanation of the decision

### Create Version Plan
```bash
pnpm tsx src/cli.ts create-version-plan \
  --project=<project-name> \
  --version-type=<major|minor|patch> \
  --only-touched=<true|false>
```
Creates an NX version plan for the specified project:
- Automatically generates conventional commit style changelog messages
- Handles project name normalization (adds @baudevs/ prefix if needed)
- Creates and commits the version plan to .nx/version-plans/
- Supports both space-separated and equals-sign argument formats

Example:
```bash
pnpm tsx src/cli.ts create-version-plan \
  --project=bau-log-hero \
  --version-type=minor \
  --only-touched=false
```

### Release
```bash
pnpm tsx src/cli.ts release \
  --project=<project-name> \
  [--skip-publish]
```
Executes the release process for a project:
- Runs linting and building on affected projects
- Executes the release with the version plan
- Optionally skips publishing with --skip-publish flag

## Documentation

- For basic usage and setup, refer to this README
- For detailed technical documentation, including advanced concepts and implementation details, see [TECHNICAL_DOCS.md](./TECHNICAL_DOCS.md)

## How It Works

1. **Git Diff Analysis**
   - Retrieves and filters relevant git changes
   - Chunks large diffs into manageable pieces

2. **Realtime Processing**
   - Establishes WebSocket connection with OpenAI
   - Processes chunks incrementally with AI feedback
   - Basic rate limit handling
   - Basic retry mechanism

3. **Connection Management**
   - Basic WebSocket lifecycle handling
   - Connection cleanup and timeouts
   - Graceful connection termination

4. **Rate Limiting**
   - Basic rate limit tracking
   - Simple backoff implementation:
     - Respects OpenAI's rate limits
     - Handles basic backoff requests
   - Rate limit state tracking:
     - Monitors remaining requests
     - Basic retry handling

5. **Error Handling**
   - Basic error recovery
   - Timeout handling
   - Connection cleanup
   - Error logging with bau-log-hero

6. **Structured Analysis**
   - Uses function calling for consistent responses
   - Basic JSON schema validation
   - Provides detailed reasoning for version decisions

## Configuration

Key constants that can be adjusted:

```typescript
const REALTIME_MODEL = 'gpt-4o-realtime-preview-2024-12-17';
const MAX_CHUNKS = 10;
const CHUNK_SIZE = 8000;
```

Connection timeouts:

```typescript
const CONNECTION_TIMEOUT = 30000;  // 30 seconds for initial connection
const RESPONSE_TIMEOUT = 30000;    // 30 seconds for responses
const CLEANUP_TIMEOUT = 5000;      // 5 seconds for cleanup
```

## Error Handling

The tool handles these error scenarios:

- WebSocket connection failures
- Basic JSON parsing errors
- Schema validation errors
- API response errors
- Basic rate limit handling
- Connection timeouts
- Cleanup failures

## Dependencies

- `ws`: WebSocket client for realtime communication
- `ajv`: JSON Schema validation
- `@baudevs/bau-log-hero`: Structured logging

## Important Notes

1. **API Access**:
   - Requires OpenAI API key with access to realtime models
   - Uses WebSocket protocol for communication
   - Basic rate limiting implementation
   - Handles API versioning

2. **Performance**:
   - Processes diffs in chunks
   - Basic incremental processing
   - Simple connection management

3. **Validation**:
   - Basic response schema validation
   - Structured output for version decisions
   - Detailed reasoning provided for each decision

4. **Rate Limiting**:
   - Basic handling of OpenAI's rate limits
   - Simple backoff implementation
   - Basic logging of rate limit events

## Development

When developing:

1. Build dependencies:

```bash
pnpm nx build @baudevs/bau-log-hero
```

2. Build for production:

```bash
pnpm nx build @baudevs/release-tools
```

## Troubleshooting

Common issues and solutions:

1. **Connection Issues**
   - Check network connectivity
   - Verify API key permissions
   - Check for system resource constraints

2. **Rate Limiting**
   - Monitor rate limit logs
   - Review quota usage

3. **State Management**
   - Check connection state logs
   - Review error logs
