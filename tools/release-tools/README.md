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

## Documentation

- For basic usage and setup, refer to this README
- For detailed technical documentation, including advanced concepts and implementation details, see [TECHNICAL_DOCS.md](./TECHNICAL_DOCS.md)

## How It Works

1. **Git Diff Analysis**
   - Retrieves and filters relevant git changes
   - Chunks large diffs into manageable pieces

2. **Realtime Processing**
   - Establishes WebSocket connection with OpenAI
   - Maintains session state throughout analysis
   - Processes chunks incrementally with AI feedback
   - Handles rate limiting and backoff events automatically
   - Implements smart retry mechanisms with dynamic delays

3. **Connection Management**
   - Robust WebSocket lifecycle handling
   - Automatic connection cleanup and timeouts
   - State tracking and monitoring
   - Graceful connection termination
   - Connection health checks and logging

4. **Rate Limiting & Backoff**
   - Dynamic rate limit tracking
   - Smart backoff implementation:
     - Respects OpenAI's rate limits
     - Handles backoff requests automatically
     - Implements exponential backoff when needed
   - Rate limit state management:
     - Tracks remaining requests
     - Monitors reset timestamps
     - Manages retry delays
     - Handles backoff intervals

5. **Error Recovery**
   - Automatic retry on transient failures
   - Smart timeout handling
   - Connection state recovery
   - Graceful degradation
   - Comprehensive error logging

6. **Structured Analysis**
   - Uses function calling for consistent responses
   - Validates all responses against JSON schemas
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

The tool handles various error scenarios:

- WebSocket connection failures
- JSON parsing errors
- Schema validation errors
- API response errors
- Rate limit exceeded errors
- Backoff request handling
- Connection timeouts
- State transition errors
- Cleanup failures

## Dependencies

- `ws`: WebSocket client for realtime communication
- `ajv`: JSON Schema validation
- `@baudevs/bau-log-hero`: Structured logging

## Important Notes

1. **API Access**:
   - Requires OpenAI API key with access to realtime models
   - Uses WebSocket protocol for efficient communication
   - Implements rate limiting best practices
   - Handles API versioning and beta features

2. **Performance**:
   - Processes diffs in chunks to handle large changes
   - Uses incremental processing for faster results
   - Maintains session state for context
   - Smart rate limit handling for optimal throughput
   - Efficient connection management

3. **Validation**:
   - All responses are schema-validated
   - Structured output ensures reliable version decisions
   - Detailed reasoning provided for each decision
   - Connection state validation

4. **Rate Limiting**:
   - Automatically handles OpenAI's rate limits
   - Implements exponential backoff when needed
   - Provides detailed logging of rate limit events
   - Gracefully handles API throttling

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

## Troubleshooting

Common issues and solutions:

1. **Connection Timeouts**
   - Check network connectivity
   - Verify API key permissions
   - Review rate limit status
   - Check for system resource constraints

2. **Rate Limiting**
   - Monitor rate limit logs
   - Adjust request timing
   - Implement request batching
   - Review quota usage

3. **State Management**
   - Check connection state logs
   - Verify cleanup procedures
   - Monitor resource usage
   - Review error logs
