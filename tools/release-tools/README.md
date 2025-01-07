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

## How It Works

1. **Git Diff Analysis**
   - Retrieves and filters relevant git changes
   - Chunks large diffs into manageable pieces

2. **Realtime Processing**
   - Establishes WebSocket connection with OpenAI
   - Maintains session state throughout analysis
   - Processes chunks incrementally with AI feedback

3. **Structured Analysis**
   - Uses function calling for consistent responses
   - Validates all responses against JSON schemas
   - Provides detailed reasoning for version decisions

## Debugging

The tool includes comprehensive logging using `@baudevs/bau-log-hero`:

### Log Configuration

```typescript
{
  console: {
    enabled: true,
    truncateJson: {
      enabled: true,
      firstLines: 4,
      lastLines: 4
    }
  },
  file: {
    enabled: true,
    path: './logs/release-tools/realtime',
    format: 'json',
    rotation: {
      enabled: true,
      maxSize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5,
      compress: true
    }
  }
}
```

### Log Events

- WebSocket connection events
- Chunk processing progress
- Response validations
- Final analysis results

## Configuration

Key constants that can be adjusted:

```typescript
const REALTIME_MODEL = 'gpt-4o-realtime-preview-2024-12-17';
const MAX_CHUNKS = 10;
const CHUNK_SIZE = 8000;
```

## Error Handling

The tool handles various error scenarios:

- WebSocket connection failures
- JSON parsing errors
- Schema validation errors
- API response errors

## Dependencies

- `ws`: WebSocket client for realtime communication
- `ajv`: JSON Schema validation
- `@baudevs/bau-log-hero`: Structured logging

## Important Notes

1. **API Access**:
   - Requires OpenAI API key with access to realtime models
   - Uses WebSocket protocol for efficient communication

2. **Performance**:
   - Processes diffs in chunks to handle large changes
   - Uses incremental processing for faster results
   - Maintains session state for context

3. **Validation**:
   - All responses are schema-validated
   - Structured output ensures reliable version decisions
   - Detailed reasoning provided for each decision

## Development

When developing:

1. Build dependencies:

```bash
pnpm nx build @baudevs/bau-log-hero
```

2. Run tests:

```bash
pnpm nx test @baudevs/release-tools
```

3. Build for production:

```bash
pnpm nx build @baudevs/release-tools
```
