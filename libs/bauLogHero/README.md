# BauLogHero

A powerful and flexible logging library for both Node.js and browser environments, featuring built-in intelligent log analysis.

## Features

- 🧠 **Smart Log Analysis**: Zero-dependency intelligent pattern detection and log grouping
- 🌍 **Universal Support**: Works in both Node.js and browser environments
- 📝 **Multiple Output Formats**: Console, file, and browser-specific outputs
- 🔄 **File Rotation**: Automatic log file rotation with compression support
- 💾 **Browser Storage**: Multiple storage options for browser environments
- 🎨 **Flexible Formatting**: JSON or text format with customizable timestamps
- 🔍 **Deep Object Inspection**: Configurable depth for object serialization
- 🚦 **Log Levels**: Support for debug, info, warn, and error levels

## Installation

```bash
npm install @baudevs/bau-log-hero
```

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
```

## Advanced Configuration

### File Output (Node.js)

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
        compress: true
      }
    }
  }
});
```

### Browser Storage

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

### Timestamp Configuration

```typescript
const logger = createLogger({
  timestamp: true,
  timestampFormat: 'iso' // 'short' | 'none'
});
```

### Pretty Printing

```typescript
const logger = createLogger({
  output: {
    prettyPrint: true,
    maxDepth: 3 // Maximum depth for object serialization
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
| browserFallback | 'download' \| 'localStorage' \| 'console' \| 'none' | 'none' | Browser fallback strategy |
| rotation | RotationConfig | - | File rotation settings |

### RotationConfig

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| enabled | boolean | false | Enable file rotation |
| maxSize | number | 5MB | Maximum file size before rotation |
| maxFiles | number | 5 | Maximum number of backup files |
| compress | boolean | false | Compress rotated files |

## Browser Support

In browser environments, file output is handled according to the `browserFallback` setting:

- `'download'`: Downloads logs as JSON files (batched every 100 entries)
- `'localStorage'`: Stores logs in localStorage (limited to last 1000 entries)
- `'console'`: Outputs file logs to console
- `'none'`: Disables file output

## Error Handling

The library includes built-in error handling and formatting:

```typescript
logger.error(new Error('Something went wrong'));
// Automatically captures stack trace and formats error
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

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

### Advanced Configuration

```typescript
const analyzer = new SmartAnalyzer({
  groupingSimilarityThreshold: 0.8, // How similar messages need to be to group (0-1)
  timeWindowMinutes: 60,           // How long to keep groups in memory
  maxGroups: 100,                  // Maximum number of groups to track
  minGroupSize: 3                  // Minimum entries to consider a pattern
});
```

### Pattern Detection

The smart analyzer automatically:

- Normalizes timestamps, UUIDs, and numbers in messages
- Groups similar message patterns together
- Tracks frequency and severity of patterns
- Extracts contextual information like IPs, URLs, and status codes

### Context Extraction

```typescript
logger.error('Failed to connect to database at 192.168.1.100:5432', {
  attempt: 3,
  timeout: 5000
});

// The analyzer will automatically extract and group:
// - IP address: 192.168.1.100
// - Port number: 5432
// - Additional context from the metadata object
```

### Real-world Use Cases

1. **Error Pattern Detection**

   ```typescript
   const { groups } = analyzer.getInsights();
   const errorPatterns = groups
     .filter(g => g.severity === 'high')
     .map(g => ({
       pattern: g.pattern,
       frequency: g.frequency,
       lastSeen: g.lastSeen,
       context: g.context
     }));
   ```

2. **API Health Monitoring**

   ```typescript
   const healthCheck = groups
     .filter(g => g.context.statusCode >= 500)
     .reduce((acc, g) => acc + g.frequency, 0);
   ```

3. **Security Analysis**

   ```typescript
   const suspiciousIPs = groups
     .filter(g => g.context.statusCode === 401)
     .flatMap(g => g.context.ip)
     .filter(Boolean);
   ```
