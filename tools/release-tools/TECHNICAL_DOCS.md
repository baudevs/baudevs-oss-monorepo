# Technical Documentation for @baudevs/release-tools

## Table of Contents

1. [WebSocket Implementation](#websocket-implementation)
2. [Promise Patterns](#promise-patterns)
3. [Rate Limiting & Backoff](#rate-limiting--backoff)
4. [Event Handling](#event-handling)
5. [Error Handling & Recovery](#error-handling--recovery)
6. [Connection Lifecycle](#connection-lifecycle)
7. [Advanced Concepts](#advanced-concepts)

## WebSocket Implementation

### Connection States

The WebSocket connection can be in one of four states:

```typescript
WebSocket.CONNECTING (0) // Socket has been created, connection in progress
WebSocket.OPEN (1)      // Connection is open and ready to communicate
WebSocket.CLOSING (2)   // Connection is in the process of closing
WebSocket.CLOSED (3)    // Connection is closed or couldn't be opened
```

### Event Listeners

We implement three main types of event listeners:

```typescript
ws.on('message', (data) => { /* Handle incoming messages */ });
ws.on('close', () => { /* Handle connection closure */ });
ws.on('error', (error) => { /* Handle errors */ });
```

### Cleanup Pattern

We use a robust cleanup pattern to prevent memory leaks:

```typescript
const cleanup = () => {
  clearTimeout(timeoutId);         // Clear any pending timeouts
  ws.removeAllListeners();         // Remove all event listeners
  ws.off('message', onMessage);    // Remove specific listeners
  ws.off('close', onClose);
  ws.off('error', onError);
};
```

## Promise Patterns

### Promise.race()

We use `Promise.race()` for implementing timeouts and competing promises:

```typescript
await Promise.race([
  new Promise<void>((resolve, reject) => {
    // Main operation promise
  }),
  new Promise<never>((_, reject) => {
    // Timeout promise
    setTimeout(() => reject(new Error('Timeout')), 30000);
  })
]);
```

This pattern ensures that:

- If the main operation completes first, we get its result
- If the timeout occurs first, we get a rejection
- The first promise to settle wins the race

### AbortController

We use `AbortController` for advanced timeout management:

```typescript
const abortController = new AbortController();
const { signal } = abortController;

signal.addEventListener('abort', () => {
  // Cleanup code here
});

// Later...
abortController.abort(); // Triggers all abort listeners
```

### Promise Chaining

We implement sophisticated promise chains for sequential operations:

```typescript
waitIfNeeded()
  .then(() => ws.send(serializedEvent))
  .then(() => waitForFinalResponse(ws))
  .then(response => {
    if (!response.trim()) {
      logger.warn('Empty response');
    }
    return response;
  })
  .catch(error => {
    // Error handling
  });
```

## Rate Limiting & Backoff

### Rate Limit State Management

```typescript
interface RateLimitState {
  remainingRequests: number;
  resetAt: Date | null;
  retryAfter: number;
  backoffMs: number;
}
```

### Dynamic Backoff Implementation

```typescript
function getWaitTime(): number {
  if (rateLimitState.remainingRequests <= 0 && rateLimitState.resetAt) {
    const now = new Date();
    if (now < rateLimitState.resetAt) {
      return rateLimitState.resetAt.getTime() - now.getTime();
    }
  }
  return Math.max(rateLimitState.retryAfter * 1000, rateLimitState.backoffMs);
}
```

## Event Handling

### Event Types

```typescript
interface ServerEvent {
  type: 'response.partial' | 'response.final' | 'response.done' | 'response.error' | 'rate_limit' | 'backoff';
  response?: {
    text?: string;
  };
  remaining_requests?: number;
  reset_at?: string;
  retry_after?: number;
  wait_ms?: number;
}
```

### Event Processing Pipeline

1. Raw message reception
2. JSON parsing
3. Type validation
4. Event-specific handling
5. State updates
6. Response aggregation

## Error Handling & Recovery

### Error Categories

1. **Connection Errors**
   - Connection timeout
   - Connection refused
   - Network issues

2. **Protocol Errors**
   - Invalid message format
   - Schema validation failures
   - Unexpected message types

3. **State Errors**
   - Invalid state transitions
   - Missing session ID
   - Incomplete responses

### Recovery Strategies

```typescript
async function sendEventWithRetries<T>(
  ws: WebSocket,
  eventObj: RequestEvent,
  schemaValidator: ValidateFunction,
  maxRetries = 3
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Attempt operation
    } catch (err) {
      if (attempt === maxRetries) throw err;
      // Implement exponential backoff
      await new Promise(resolve => 
        setTimeout(resolve, Math.pow(2, attempt) * 1000)
      );
    }
  }
}
```

## Connection Lifecycle

### 1. Connection Establishment

```typescript
function createRealtimeConnection(): WebSocket {
  return new WebSocket(url, {
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'OpenAI-Beta': 'realtime=v1',
    },
  });
}
```

### 2. Session Management

```typescript
async function setupWebSocketListeners(ws: WebSocket): Promise<string> {
  return new Promise((resolve, reject) => {
    // Session setup and monitoring
  });
}
```

### 3. Message Processing

```typescript
const onMessage = (data: WebSocket.Data) => {
  // 1. Parse raw message
  // 2. Validate event structure
  // 3. Update state if needed
  // 4. Process response data
  // 5. Resolve/reject promises
};
```

### 4. Graceful Shutdown

```typescript
const cleanup = () => {
  clearTimeout(timeoutId);
  if (ws?.readyState === WebSocket.OPEN) {
    ws.removeAllListeners();
    ws.close(1000, 'Normal closure');
  }
};
```

## Advanced Concepts

### State Machine Pattern

The WebSocket connection implements a state machine pattern:

```
CONNECTING → OPEN → CLOSING → CLOSED
     ↑         |        ↑
     |         |        |
     └─────────┴────────┘
```

### Event Aggregation

We use a buffer pattern for aggregating partial responses:

```typescript
let functionCallArguments = '';
let partialText = '';

// Aggregate events
case 'response.function_call_arguments.delta':
  functionCallArguments += event.delta;
  break;
case 'response.partial':
  if (event.response?.text) {
    partialText += event.response.text;
  }
  break;
```

### Race Condition Prevention

We use several techniques to prevent race conditions:

1. Single-responsibility event handlers
2. State synchronization
3. Atomic operations
4. Proper cleanup sequencing

Example:

```typescript
const finished = false;
// Only the first completion wins
if (!finished) {
  finished = true;
  cleanup();
  resolve(result);
}
```

### Memory Management

We implement several memory management best practices:

1. Proper event listener cleanup
2. Timeout clearance
3. Buffer management
4. Reference cleanup

### Logging Strategy

We use structured logging with context:

```typescript
logger.debug(`WebSocket state [${context}]`, {
  state: states[ws.readyState],
  readyState: ws.readyState
});
```

This provides:

- Context-aware logging
- Structured data
- Debug information
- State tracking

## Best Practices

1. **Always cleanup resources**

   ```typescript
   try {
     // Operation
   } finally {
     cleanup();
   }
   ```

2. **Use proper error handling**

   ```typescript
   catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error('Error details', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
   }
   ```

3. **Implement proper timeouts**

   ```typescript
   Promise.race([
     operation(),
     new Promise((_, reject) => 
       setTimeout(() => reject(new Error('Timeout')), 30000)
     )
   ]);
   ```

4. **Handle all WebSocket states**

   ```typescript
   switch (ws.readyState) {
     case WebSocket.CONNECTING:
       // Handle connecting state
       break;
     case WebSocket.OPEN:
       // Handle open state
       break;
     case WebSocket.CLOSING:
       // Handle closing state
       break;
     case WebSocket.CLOSED:
       // Handle closed state
       break;
   }
   ```

## Performance Considerations

1. **Message Buffering**
   - Use string concatenation for small messages
   - Use array buffering for large messages
   - Implement proper buffer cleanup

2. **Memory Management**
   - Clear event listeners
   - Clean up timeouts
   - Release references
   - Implement proper garbage collection hints

3. **Connection Management**
   - Implement connection pooling
   - Handle reconnection logic
   - Manage concurrent connections
   - Monitor connection health

4. **Error Recovery**
   - Implement exponential backoff
   - Handle partial failures
   - Maintain operation atomicity
   - Implement proper state recovery
