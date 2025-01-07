# BauLogHero

A powerful, modern logging library for both Node.js and browser environments, with support for structured logging, file rotation, and smart console output.

## Features

- 🌐 **Universal Support**: Works in both Node.js and browser environments
- 📝 **JSON Lines Format**: Structured logging for better analytics
- 🔄 **File Rotation**: Size-based rotation with compression
- 🎨 **Smart Console Output**: Truncated JSON for better readability
- 💾 **Browser Storage**: Multiple storage options (download, localStorage, console)
- 🎯 **Type Safety**: Written in TypeScript with full type definitions
- 🚀 **Modern APIs**: Uses latest Node.js and browser APIs

## Installation

```bash
npm install @baudevs/bau-log-hero
# or
pnpm add @baudevs/bau-log-hero
# or
yarn add @baudevs/bau-log-hero
```

## Quick Start

```typescript
import { createLogger } from '@baudevs/bau-log-hero';

const logger = createLogger({
  name: 'my-app',
  level: 'debug',
  output: {
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
      path: './logs',
      format: 'json',
      rotation: {
        enabled: true,
        maxSize: 5 * 1024 * 1024, // 5MB
        maxFiles: 5,
        compress: true
      }
    }
  }
});

// Basic logging
logger.info('Application started');

// Structured logging
logger.info('User action', {
  userId: '123',
  action: 'login',
  metadata: {
    ip: '127.0.0.1',
    userAgent: 'Chrome'
  }
});
```

## Configuration

### Console Output

```typescript
{
  console: {
    enabled: true,
    truncateJson: {
      enabled: true,     // Enable JSON truncation in console
      firstLines: 4,     // Show first 4 lines
      lastLines: 4       // Show last 4 lines
    }
  }
}
```

### File Output

```typescript
{
  file: {
    enabled: true,
    path: './logs',
    format: 'json',      // 'json' or 'text'
    rotation: {
      enabled: true,
      maxSize: 5 * 1024 * 1024,  // 5MB
      maxFiles: 5,
      compress: true     // Compress rotated files
    }
  }
}
```

### Browser Fallbacks

When running in a browser, file output falls back to one of these options:

```typescript
{
  file: {
    browserFallback: 'download'    // Save as .jsonl file
    // or
    browserFallback: 'localStorage' // Store in localStorage
    // or
    browserFallback: 'console'     // Output to console
    // or
    browserFallback: 'none'        // Disable file output
  }
}
```

## Log Format

### JSON Lines Format

Each log entry is a single line of JSON:

```json
{"timestamp":"2024-01-07T12:34:56.789Z","level":"info","logger":"my-app","message":"Application started","metadata":{"filename":"app.ts","pid":1234,"hostname":"my-machine"}}
{"timestamp":"2024-01-07T12:34:57.123Z","level":"debug","logger":"my-app","message":"Processing request","data":["GET /api/users"],"metadata":{"filename":"api.ts","pid":1234,"hostname":"my-machine"}}
```

### Console Output

Console output includes:

- Emoji indicators (🔍 debug, ℹ️ info, ⚠️ warn, ❌ error)
- Timestamps in dim color
- Log level in appropriate color
- Source filename
- Truncated JSON for better readability

Example:

```json
ℹ️ [2024-01-07T12:34:56.789Z] INFO [app.ts] → User logged in
{
  userId: "123",
  action: "login",
  ...
  metadata: {
    ip: "127.0.0.1"
  }
}
```

## Browser Storage

### LocalStorage

- Uses size-based rotation like Node.js
- Default 5MB limit
- Stores in JSON Lines format
- Automatically removes oldest entries when full

### Download

- Saves immediately as `.jsonl` file
- Uses File System Access API when available
- Falls back to legacy download for older browsers
- Includes timestamp in filename

## Best Practices

1. Use structured logging:

```typescript
// Good
logger.info('User action', { userId, action, data });

// Avoid
logger.info(`User ${userId} performed ${action}`);
```

2. Use appropriate log levels:

```typescript
logger.debug('Detailed debugging info');
logger.info('Normal operation events');
logger.warn('Warning conditions');
logger.error('Error conditions');
```

3. Include context in logs:

```typescript
logger.info('API request', {
  method: 'GET',
  path: '/api/users',
  duration: 123,
  status: 200
});
```

4. Configure rotation limits based on your needs:

```typescript
{
  rotation: {
    maxSize: 10 * 1024 * 1024,  // 10MB per file
    maxFiles: 7,                 // Keep 1 week of logs
    compress: true              // Save disk space
  }
}
```

## Smart Analysis

BauLogHero includes a powerful smart analysis feature that helps you make sense of your logs by automatically grouping and analyzing patterns in real-time.

### Features

- 🔍 **Pattern Detection**: Automatically groups similar log messages using efficient string similarity algorithms
- 🎯 **Context Extraction**: Extracts and tracks IPs, URLs, status codes, and other contextual information
- ⚡️ **Real-time Analysis**: Analyzes logs as they come in, with configurable thresholds
- 📊 **Intelligent Summaries**: Generates insights about log patterns and their frequencies

### Usage

```typescript
import { createLogger, SmartAnalyzer } from '@baudevs/bau-log-hero';

// Create analyzer with custom options
const analyzer = new SmartAnalyzer({
  groupingSimilarityThreshold: 0.8,  // How similar messages should be to group (0-1)
  timeWindowMinutes: 60,             // Time window for analysis
  maxGroups: 100,                    // Maximum number of pattern groups to track
  minGroupSize: 3                    // Minimum entries to form a group
});

// Create logger and connect to analyzer
const logger = createLogger({
  name: 'my-app',
  level: 'debug'
});

// Analyze logs as they come in
logger.on('log', (entry) => analyzer.analyze(entry));

// Get insights periodically
setInterval(() => {
  const { groups, summary } = analyzer.getInsights();
  console.log('Log Analysis Summary:', summary);
  
  // Example output:
  // Analyzed 1250 events in 45 groups.
  // Found 3 high-severity patterns.
  // Top patterns:
  // - "Failed to connect to database" (23 times)
  // - "Request timeout for /api/users" (15 times)
  // - "Invalid authentication token" (12 times)
  
  // Access detailed group information
  groups.forEach(group => {
    console.log(`Pattern: ${group.pattern}`);
    console.log(`Frequency: ${group.frequency}`);
    console.log(`Severity: ${group.severity}`);
    console.log(`First seen: ${group.firstSeen}`);
    console.log(`Last seen: ${group.lastSeen}`);
    console.log(`Context:`, group.context);
  });
}, 60000);
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| groupingSimilarityThreshold | number | 0.8 | How similar messages should be to be grouped (0-1) |
| timeWindowMinutes | number | 60 | Time window for analysis in minutes |
| maxGroups | number | 100 | Maximum number of pattern groups to track |
| minGroupSize | number | 3 | Minimum entries required to form a group |

### Pattern Detection

The analyzer uses string similarity algorithms to group logs, with features like:

- Variable data normalization (timestamps, UUIDs, numbers)
- Token-based similarity matching
- Configurable similarity thresholds
- Automatic pattern extraction

### Context Tracking

Automatically extracts and tracks contextual information:

- IP addresses
- URLs and endpoints
- HTTP status codes
- Custom context from log metadata
- Frequency analysis of values

### Privacy and Performance

- 🔒 All analysis happens locally in your application
- 💨 Zero external dependencies
- 🚀 Efficient string matching algorithms
- 💾 Configurable memory usage limits
- ⚡️ Real-time processing with minimal overhead

## License

MIT
