# BauLogHero

A powerful and flexible logging library for both Node.js and browser environments, featuring built-in intelligent log analysis. Built with modern ES2024 features and best practices.

## Features

- 🧠 **Smart Log Analysis**: Zero-dependency intelligent pattern detection and log grouping
- 🌍 **Universal Support**: Works in both Node.js and browser environments
- 📝 **Multiple Output Formats**: Console, file, and browser-specific outputs
- 🔄 **File Rotation**: Automatic log file rotation with compression support
- 💾 **Modern Storage**: File System Access API with localStorage fallback
- 🎨 **Flexible Formatting**: JSON or text format with customizable timestamps
- 🔍 **Deep Object Inspection**: Smart object serialization with Map/Set support
- 🚦 **Log Levels**: Support for debug, info, warn, and error levels
- 🔒 **Privacy-First**: All analysis happens locally
- ⚡️ **Modern JavaScript**: Built with ES2024 features
- 🎯 **Zero Dependencies**: No external runtime dependencies

## Installation

```bash
npm install @baudevs/bau-log-hero
```

### Node.js Requirements

The library uses modern Node.js built-in modules (`node:fs/promises`, `node:path`, `node:zlib`) for file operations in Node.js environments. These are:

- Only loaded when needed (dynamic imports)
- Only used in Node.js environment (not in browsers)
- Not bundled with the library (they're built-in Node.js modules)

When building applications using this library, you might see warnings about "Unresolved dependencies" for these Node.js modules - this is expected and not a problem, as they're handled correctly at runtime.

## Basic Usage

```typescript
import { createLogger } from '@baudevs/bau-log-hero';

const logger = createLogger({
  name: 'my-app',
  level: 'debug'
});

logger.info('Hello world');
logger.debug('Debug message', { data: 123 });
logger.error(new Error('Something went wrong'));

// Smart object logging
const myMap = new Map([['key', 'value']]);
const mySet = new Set([1, 2, 3]);
logger.info('Data structures:', { myMap, mySet });
// Output: Data structures: { myMap: Map(1) { key => value }, mySet: Set(3) { 1, 2, 3 } }
```

## Modern Features

### File System Access API (Browser)

```typescript
const logger = createLogger({
  name: 'my-app',
  output: {
    file: {
      enabled: true,
      format: 'json',
      browserFallback: 'download' // Uses modern File System Access API
    }
  }
});

// Logs will be saved using the native file picker
// Falls back to legacy download if not supported
```

### ESM Node.js Features

```typescript
const logger = createLogger({
  name: 'my-app',
  output: {
    file: {
      enabled: true,
      path: './logs',
      format: 'json',
      rotation: {
        enabled: true,
        maxSize: 5 * 1024 * 1024, // 5MB
        maxFiles: 5,
        compress: true // Uses Node.js zlib for compression
      }
    }
  }
});
```

### Smart Object Serialization

The library intelligently handles various JavaScript data types:

```typescript
// Error objects with stack traces
logger.error(new Error('Failed to process'));

// Maps and Sets
const userRoles = new Map([['admin', ['read', 'write']]]);
logger.info('User roles:', userRoles);

// Circular references
const circular = { self: null };
circular.self = circular;
logger.info('Handled gracefully:', circular);

// Deep objects with customizable depth
logger.info('Deep object:', complexObj, { maxDepth: 5 });
```

### Browser Storage Options

```typescript
const logger = createLogger({
  name: 'my-app',
  output: {
    file: {
      enabled: true,
      format: 'json',
      browserFallback: 'localStorage' // or 'download', 'console', 'none'
    }
  }
});

// Access stored logs
const logs = Logger.getLogsFromStorage();
Logger.clearLogsFromStorage();
```

### Modern Configuration

```typescript
const logger = createLogger({
  name: 'my-app',
  timestamp: true,
  timestampFormat: 'iso', // 'short' | 'none'
  output: {
    console: true,
    file: {
      enabled: true,
      format: 'json',
      path: './logs',
      rotation: {
        enabled: true,
        maxSize: 5 * 1024 * 1024,
        maxFiles: 5,
        compress: true
      }
    },
    prettyPrint: true,
    maxDepth: 3
  }
});
```

## Configuration Options

### LoggerConfig

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| name | string | 'default' | Logger instance name |
| level | 'debug' \| 'info' \| 'warn' \| 'error' | 'info' | Minimum log level |
| timestamp | boolean | true | Include timestamps in logs |
| timestampFormat | 'iso' \| 'short' \| 'none' | 'iso' | Timestamp format |
| output | OutputConfig | - | Output configuration |

### OutputConfig

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| console | boolean | true | Enable console output |
| file | FileOutputConfig | - | File output configuration |
| prettyPrint | boolean | true | Pretty print objects/JSON |
| maxDepth | number | 3 | Maximum depth for object serialization |

### FileOutputConfig

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| enabled | boolean | false | Enable file output |
| path | string | './logs' | Log directory path (Node.js) |
| format | 'json' \| 'text' | 'text' | Log format |
| browserFallback | 'download' \| 'localStorage' \| 'console' \| 'none' | 'none' | Browser storage strategy |
| rotation | RotationConfig | - | File rotation settings |

### RotationConfig

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| enabled | boolean | false | Enable file rotation |
| maxSize | number | 5MB | Maximum file size before rotation |
| maxFiles | number | 5 | Maximum number of backup files |
| compress | boolean | false | Compress rotated files |

## Modern JavaScript Features Used

- Private class fields (`#property`)
- Nullish coalescing (`??`)
- Optional chaining (`?.`)
- Modern Node.js imports (`node:fs/promises`)
- File System Access API
- Dynamic imports
- Top-level await
- Modern error handling
- ESM modules
- Template literals
- Block-scoped declarations
- Arrow functions
- Async/await
- Structured error handling
- Modern browser APIs

## Browser Support

In browser environments, file output is handled according to the `browserFallback` setting:

- `'download'`: Uses File System Access API with legacy download fallback
- `'localStorage'`: Stores logs in localStorage (limited to last 1000 entries)
- `'console'`: Outputs file logs to console
- `'none'`: Disables file output

## Smart Log Analysis

BauLogHero includes a powerful smart analysis feature that helps you make sense of your logs by automatically grouping and analyzing patterns. The analysis runs entirely locally with zero external dependencies - no API keys or cloud services required!

Key benefits:

- 🔒 **Privacy-First**: All analysis happens locally in your application
- 🚀 **Real-Time**: Instant analysis without network latency
- 💨 **Lightweight**: Zero external dependencies
- 🔌 **Offline-Capable**: Works without internet connection
- 💰 **Cost-Effective**: No usage fees or API costs

The analyzer automatically:

- Groups similar log messages using efficient string similarity algorithms
- Detects patterns and anomalies in real-time
- Extracts contextual information (IPs, URLs, status codes)
- Provides intelligent summaries

### Basic Smart Analysis

```typescript
import { createLogger, SmartAnalyzer } from '@baudevs/bau-log-hero';

// Create a logger with smart analysis
const analyzer = new SmartAnalyzer();
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
}, 60000);
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
