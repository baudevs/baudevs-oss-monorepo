import WebSocket from 'ws';
import Ajv, { ValidateFunction } from 'ajv';
import { getFilteredGitDiff } from './git-diff-filter';
import { chunkString, limitChunks } from './chunk-helpers';
import { createLogger } from '@baudevs/bau-log-hero';

/**
 * The Realtime model to use. Example: "gpt-4o-realtime-preview-2024-12-17"
 */
const REALTIME_MODEL = 'gpt-4o-realtime-preview-2024-12-17';

/**
 * Maximum number of chunks to send to OpenAI.
 */
const MAX_CHUNKS = 10;

/**
 * Maximum chunk size in characters.
 * Adjust to keep each chunk reasonably small and avoid timeouts.
 */
const CHUNK_SIZE = 8000;

// Create a single logger with enhanced configuration
const logger = createLogger({
  name: 'real-time-version-bump',
  level: 'debug',
  output: process.env['CI'] === 'true' ? {
    // CI-specific configuration - minimal but clear output
    console: {
      enabled: true,
      truncateJson: {
        enabled: true,
        firstLines: 3,
        lastLines: 3
      }
    },
    ci: {
      enabled: true,
      minLevel: 'info',
      filterPatterns: [
        'Analyzing Git diff',
        'Creating session',
        'Session created:',
        'Processing chunk',
        'Final analysis:',
        'version_type',
        'needs_review',
        'reasoning'
      ],
      showFullObjects: true,
      truncateLength: 0,
      excludeMetadata: true,
      formatJson: {
        enabled: true,
        indent: 2,
        maxDepth: 3
      }
    }
  } : {
    // Local development configuration - rich and detailed output
    console: {
      enabled: true,
      truncateJson: {
        enabled: true,
        firstLines: 10,
        lastLines: 5
      },
      formatJson: {
        enabled: true,
        indent: 2,
        maxDepth: 5
      }
    }
  }
});

// Log initialization
logger.info('🚀 Real-time version bump initialized', {
  model: REALTIME_MODEL,
  maxChunks: MAX_CHUNKS,
  chunkSize: CHUNK_SIZE
});

/**
 * Make sure you've set OPENAI_API_KEY in your environment
 * or in GitHub Actions secrets.
 */
const OPENAI_API_KEY = process.env['OPENAI_API_KEY'] ?? '';

if (!OPENAI_API_KEY) {
  logger.error('❌ Missing OPENAI_API_KEY environment variable');
  process.exit(1);
}

/**
 * Interface for the final JSON result we expect:
 */
export interface VersionAnalysisResult {
  version_type: 'patch' | 'minor' | 'major' | 'unknown';
  needs_review: boolean;
  reasoning: string;
}

/**
 * Interface for server events received from OpenAI Realtime API.
 */

/**
 * Interface for request events sent to OpenAI Realtime API.
 */
interface RequestEvent {
  type: 'response.create';
  response: {
    modalities: string[];
    instructions: string;
  };
}

interface SummarySchema {
  type: 'object';
  properties: {
    summary: { type: 'string' };
    count_of_breaking_changes: { type: 'number' };
    count_of_fixes: { type: 'number' };
    count_of_features: { type: 'number' };
    count_of_other_changes: { type: 'number' };
    reasoning: { type: 'string' };
  };
  required?: string[];
  additionalProperties?: boolean;
}

interface FinalAnalysisSchema {
  type: 'object';
  properties: {
    version_type: { type: 'string' };
    needs_review: { type: 'boolean' };
    reasoning: { type: 'string' };
  };
  required?: string[];
  additionalProperties?: boolean;
}

interface SessionUpdateEvent {
  event_id: string;
  type: 'session.update';
  session: {
      modalities: string[];
      instructions: string;
      voice?: string;
      input_audio_format?: string;
      output_audio_format?: string;
      input_audio_transcription?: {
          model: string;
      };
      turn_detection?: {
        type: string;
        threshold: number;
        prefix_padding_ms: number;
        silence_duration_ms: number;
        create_response: boolean;
      };
      tools?: {
        type: string;
        name: string;
        description: string;
        parameters: {
          type: string;
          properties: SummarySchema['properties'] | FinalAnalysisSchema['properties'];
          required: string[];
        }
      }[]
      tool_choice?: string;
      temperature?: number;
      max_response_output_tokens?: string;
  }
}


/**
 * JSON Schemas for validation.
 */
const ajv = new Ajv();

const summarySchema: SummarySchema = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    count_of_breaking_changes: { type: 'number' },
    count_of_fixes: { type: 'number' },
    count_of_features: { type: 'number' },
    count_of_other_changes: { type: 'number' },
    reasoning: { type: 'string' }
  },
  required: ['summary', 'count_of_breaking_changes', 'count_of_fixes', 'count_of_features', 'count_of_other_changes', 'reasoning'],
  additionalProperties: true
};

const finalAnalysisSchema: FinalAnalysisSchema = {
  type: 'object',
  properties: {
    version_type: { type: 'string' },
    needs_review: { type: 'boolean' },
    reasoning: { type: 'string' }
  },
  required: ['version_type', 'needs_review', 'reasoning'],
  additionalProperties: true
};

// Compile schemas
const validateSummary = ajv.compile(summarySchema);
const validateFinalAnalysis = ajv.compile(finalAnalysisSchema);

/**
 * Parses and validates JSON based on provided schema.
 * @param jsonString The JSON string to parse.
 * @param schemaValidator The AJV compiled schema validator.
 * @returns The parsed JSON object if valid.
 * @throws Error if JSON is invalid or doesn't conform to schema.
 */
function parseAndValidateJSON<T>(jsonString: string, schemaValidator: ValidateFunction): T {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch (err) {
    throw new Error(`Invalid JSON format: ${err}`);
  }

  const valid = schemaValidator(parsed);
  if (!valid) {
    throw new Error(`JSON does not conform to schema: ${ajv.errorsText(schemaValidator.errors)}`);
  }

  return parsed as T;
}



/**
 * Create a WebSocket connection to the Realtime API.
 */
function createRealtimeConnection(): WebSocket {
  const url = `wss://api.openai.com/v1/realtime?model=${REALTIME_MODEL}`;

  return new WebSocket(url, {
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      // Required header for the Realtime API Beta
      'OpenAI-Beta': 'realtime=v1',
    },
  });
}

/**
 * Listen for server events until we see a "response.final" or "response.done"
 * and then resolve with the combined text.
 */
function waitForFinalResponse(ws: WebSocket): Promise<string> {
  return new Promise((resolve, reject) => {
    let finished = false;
    let functionCallArguments = '';
    let partialText = '';
    // eslint-disable-next-line prefer-const
    let timeoutId: NodeJS.Timeout;

    const cleanup = () => {
      logger.debug('Cleaning up WebSocket listeners');
      clearTimeout(timeoutId);
      ws.off('message', onMessage);
      ws.off('close', onClose);
      ws.off('error', onError);
      logWebSocketState(ws, 'waitForFinalResponse cleanup');
    };

    // Set a timeout to prevent hanging
    timeoutId = setTimeout(() => {
      if (!finished) {
        logger.warn('⚠️ Response timeout - resolving with current data');
        finished = true;
        cleanup();
        resolve(partialText || functionCallArguments);
      }
    }, 30000); // 30 second timeout

    const onMessage = (data: WebSocket.Data) => {
      try {
        const rawMessage = typeof data === 'string' ? data : data.toString();
        logger.debug('Raw WebSocket message received', { data: rawMessage });

        const event = JSON.parse(rawMessage);
        logger.debug('Parsed WebSocket event', { event });

        switch (event.type) {
          case 'rate_limit':
            updateRateLimitState(event as RateLimitEvent);
            break;

          case 'backoff':
            updateRateLimitState(event as BackoffEvent);
            break;

          case 'response.function_call_arguments.delta':
            functionCallArguments += event.delta;
            break;

          case 'response.function_call_arguments.done':
            if (!finished) {
              finished = true;
              cleanup();
              resolve(functionCallArguments);
            }
            break;

          case 'response.partial':
            if (event.response?.text) {
              partialText += event.response.text;
            }
            break;

          case 'response.final':
            if (!finished && event.response?.text) {
              partialText += event.response.text;
              finished = true;
              cleanup();
              resolve(partialText);
            }
            break;

          case 'response.done':
            if (!finished) {
              finished = true;
              cleanup();
              resolve(partialText || functionCallArguments);
            }
            break;

          case 'response.error': {
            const error = new Error(`Model error: ${JSON.stringify(event)}`);
            logger.error('WebSocket error response', { event });
            cleanup();
            reject(error);
            break;
          }

          case 'response.output_item.done':
            if (event.item?.arguments) {
              try {
                const args = JSON.parse(event.item.arguments);
                if (!finished) {
                  finished = true;
                  cleanup();
                  resolve(JSON.stringify(args));
                }
              } catch (err) {
                logger.warn('Failed to parse output item arguments', { error: err });
              }
            }
            break;

          case 'session.created':
          case 'session.updated':
            // These events are handled by setupWebSocketListeners
            break;

          default:
            logger.debug('Unhandled event type', { type: event.type, event });
            break;
        }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        const error = `Failed to parse server event: ${data}`;
        logger.error('WebSocket parse error', { error, data });
        cleanup();
        reject(new Error(error));
      }
    };

    const onClose = () => {
      if (!finished) {
        const error = 'WebSocket closed before final response';
        logger.error('❌ WebSocket closed prematurely', { partialText });
        logError(new Error(error));
        cleanup();
        reject(new Error(error));
      }
    };

    const onError = (err: Error) => {
      logger.error('❌ WebSocket error', { error: err });
      logError(err);
      cleanup();
      reject(err);
    };

    ws.on('message', onMessage);
    ws.on('close', onClose);
    ws.on('error', onError);
  });
}


async function sendSessionUpdateEvent(ws: WebSocket, eventObj: SessionUpdateEvent): Promise<string> {
  const serializedEvent = JSON.stringify(eventObj);
  logger.debug('Sending session update', { event: eventObj });
  ws.send(serializedEvent);
  return await setupWebSocketListeners(ws);
}

/**
 * Send one "response.create" event to the Realtime model,
 * and wait for the final text using `waitForFinalResponse()`.
 */
async function sendEventAndAwait(ws: WebSocket, eventObj: RequestEvent | SessionUpdateEvent): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      logWebSocketState(ws, 'sendEventAndAwait start');
      const serializedEvent = JSON.stringify(eventObj);
      logger.debug('Sending WebSocket event', { event: eventObj });

      // Wait for any rate limits or backoff before sending
      waitIfNeeded().then(() => {
        logWebSocketState(ws, 'pre-send');
        ws.send(serializedEvent);
        waitForFinalResponse(ws).then(response => {
          logWebSocketState(ws, 'post-response');
          if (!response.trim()) {
            logger.warn('⚠️ Received empty response from WebSocket');
          }
          resolve(response);
        }).catch(reject);
      }).catch(reject);
    } catch (err) {
      logWebSocketState(ws, 'sendEventAndAwait error');
      logger.error('❌ Error sending WebSocket event', { error: err });
      logError(err);
      reject(err);
    }
  });
}



// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function logGitDiff(diff: string): Promise<void> {
  await logger.debug('📄 Git Diff Content', { diff });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function logChunk(chunkIndex: number, content: string): Promise<void> {
  await logger.debug(`🔍 Chunk ${chunkIndex} Content`, { content });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function logChunkSummary(chunkIndex: number, summary: string): Promise<void> {
  await logger.info(`📝 Chunk ${chunkIndex} Summary`, { summary });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function logWebSocketEvent(eventType: string, content: unknown): Promise<void> {
  return logger.debug(`🔌 WebSocket Event: ${eventType}`, { content });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function logFinalAnalysis(analysis: unknown): Promise<void> {
  return logger.info('✅ Final Analysis', { analysis });
}

async function logError(error: Error | unknown): Promise<void> {
  if (error instanceof Error) {
    return logger.error('❌ Error occurred', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    });
  }
  return logger.error('❌ Unknown error occurred', { error });
}

async function setupWebSocketListeners(ws: WebSocket): Promise<string> {
  return new Promise((resolve, reject) => {
    let sessionId: string | null = null;
    // eslint-disable-next-line prefer-const
    let timeoutId: NodeJS.Timeout;

    const cleanup = () => {
      logger.debug('Cleaning up session listeners');
      clearTimeout(timeoutId);
      ws.off('message', onMessage);
      ws.off('error', onError);
      ws.off('close', onClose);
      logWebSocketState(ws, 'setupWebSocketListeners cleanup');
    };

    // Set a timeout to prevent hanging
    timeoutId = setTimeout(() => {
      if (!sessionId) {
        logger.warn('⚠️ Session setup timeout');
        cleanup();
        reject(new Error('Session setup timeout'));
      }
    }, 30000); // 30 second timeout

    const onMessage = (data: WebSocket.Data) => {
      try {
        const rawMessage = typeof data === 'string' ? data : data.toString();
        logger.debug('Raw WebSocket message received', { data: rawMessage });

        const event = JSON.parse(rawMessage);
        logger.debug('Parsed WebSocket event', { event });

        switch (event.type) {
          case 'session.created':
            if (event.session?.id) {
              sessionId = event.session.id;
              logger.info('Session created', { sessionId: event.session.id });
              cleanup();
              resolve(event.session.id);
            }
            break;

          case 'session.updated':
            if (event.session?.id) {
              sessionId = event.session.id;
              logger.info('Session updated', { sessionId: event.session.id });
              cleanup();
              resolve(event.session.id);
            }
            break;

          case 'response.error': {
            const error = new Error(`Model error: ${JSON.stringify(event)}`);
            logger.error('WebSocket error response', { event });
            cleanup();
            reject(error);
            break;
          }

          default:
            logger.debug('Received event', { type: event.type, event });
            break;
        }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        const error = `Failed to parse server event: ${data}`;
        logger.error('WebSocket parse error', { error, data });
        cleanup();
        reject(new Error(error));
      }
    };

    const onError = (err: Error) => {
      logger.error('WebSocket error', { error: err });
      cleanup();
      reject(err);
    };

    const onClose = () => {
      if (!sessionId) {
        logger.warn('WebSocket closed before session was established');
        cleanup();
        reject(new Error('WebSocket closed before session was established'));
      }
    };

    ws.on('message', onMessage);
    ws.on('error', onError);
    ws.on('close', onClose);
  });
}

interface RateLimitEvent {
  type: 'rate_limit';
  remaining_requests: number;
  reset_at: string;
  retry_after: number;
}

interface BackoffEvent {
  type: 'backoff';
  wait_ms: number;
}

// Rate limiting state management
interface RateLimitState {
  remainingRequests: number;
  resetAt: Date | null;
  retryAfter: number;
  backoffMs: number;
}

const rateLimitState: RateLimitState = {
  remainingRequests: Infinity,
  resetAt: null,
  retryAfter: 0,
  backoffMs: 0
};

/**
 * Updates the rate limit state based on events from the API
 */
function updateRateLimitState(event: RateLimitEvent | BackoffEvent): void {
  if (event.type === 'rate_limit') {
    rateLimitState.remainingRequests = event.remaining_requests;
    rateLimitState.resetAt = new Date(event.reset_at);
    rateLimitState.retryAfter = event.retry_after;
    logger.warn('⚠️ Rate limit update', {
      remainingRequests: event.remaining_requests,
      resetAt: event.reset_at,
      retryAfter: event.retry_after
    });
  } else if (event.type === 'backoff') {
    rateLimitState.backoffMs = event.wait_ms;
    logger.warn('⚠️ Backoff requested', { waitMs: event.wait_ms });
  }
}

/**
 * Checks if we need to wait before making the next request
 * @returns The number of milliseconds to wait, or 0 if no wait is needed
 */
function getWaitTime(): number {
  if (rateLimitState.remainingRequests <= 0 && rateLimitState.resetAt) {
    const now = new Date();
    if (now < rateLimitState.resetAt) {
      return rateLimitState.resetAt.getTime() - now.getTime();
    }
  }
  return Math.max(rateLimitState.retryAfter * 1000, rateLimitState.backoffMs);
}

/**
 * Waits for the appropriate time based on rate limits and backoff
 */
async function waitIfNeeded(): Promise<void> {
  const waitTime = getWaitTime();
  if (waitTime > 0) {
    logger.info(`⏳ Waiting ${waitTime}ms before next request`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
}

export async function analyzeGitDiffForVersion(): Promise<string> {
  let ws: WebSocket | null = null;
  let closeTimeout: NodeJS.Timeout;

  try {
    // 1. Get the filtered Git diff
    const diff = await getFilteredGitDiff();
    if (!diff) {
      logger.warn('No Git diff found');
      return JSON.stringify({
        version_type: 'unknown',
        needs_review: true,
        reasoning: 'No Git diff found to analyze'
      });
    }

    if (diff.length < 10) {
      logger.warn('Git diff too small to analyze');
      return JSON.stringify({
        version_type: 'unknown',
        needs_review: true,
        reasoning: 'Git diff too small to analyze meaningfully'
      });
    }

    // 2. Chunk the diff
    const rawChunks = chunkString(diff, CHUNK_SIZE);
    const limitedChunks = limitChunks(rawChunks, MAX_CHUNKS);
    logger.info(`Processing ${limitedChunks.length} chunk(s) for analysis`);

    // 3. Connect to Realtime API
    ws = createRealtimeConnection();
    logWebSocketState(ws, 'initial connection');

    // Create an AbortController for timeout management
    const abortController = new AbortController();
    const { signal } = abortController;

    // Wait for connection with timeout
    try {
      await Promise.race([
        new Promise<void>((resolve, reject) => {
          const connectionTimeout = setTimeout(() => {
            logWebSocketState(ws, 'connection timeout');
            reject(new Error('WebSocket connection timeout'));
          }, 30000);

          ws?.once('open', () => {
            logWebSocketState(ws, 'connection open');
            clearTimeout(connectionTimeout);
            resolve();
          });

          ws?.once('error', (error) => {
            logWebSocketState(ws, 'connection error');
            clearTimeout(connectionTimeout);
            reject(error);
          });

          // Clean up on abort
          signal.addEventListener('abort', () => {
            clearTimeout(connectionTimeout);
            reject(new Error('Connection aborted'));
          });
        }),
        new Promise<never>((_, reject) => {
          const globalTimeout = setTimeout(() => {
            logWebSocketState(ws, 'global timeout');
            abortController.abort();
            reject(new Error('Global connection timeout'));
          }, 30000);

          // Clean up on success
          signal.addEventListener('abort', () => {
            clearTimeout(globalTimeout);
          });
        })
      ]);
    } catch (error) {
      abortController.abort(); // Ensure all timeouts are cleaned up
      throw error;
    }

    // Cleanup the abort controller
    abortController.abort();

    // 4. Initialize session with initial instructions
    const initialSessionEvent: SessionUpdateEvent = {
      type: 'session.update',
      event_id: crypto.randomUUID(),
      session: {
        modalities: ['text'],
        instructions: `
          You are a senior developer analyzing Git diffs.
          You will receive chunks of Git diff content and should summarize the changes,
          focusing on identifying breaking changes, new features, and bug fixes.
          Please provide structured summaries that can be used to determine version bumps.
        `,
        tools: [{
          type: 'function',
          name: 'summary_response',
          description: 'Summarize the given chunk of text',
          parameters: {
            type: 'object',
            properties: {
              summary: { type: 'string' },
              count_of_breaking_changes: { type: 'number' },
              count_of_fixes: { type: 'number' },
              count_of_features: { type: 'number' },
              count_of_other_changes: { type: 'number' },
              reasoning: { type: 'string' }
            },
            required: ['summary', 'count_of_breaking_changes', 'count_of_fixes', 'count_of_features', 'count_of_other_changes', 'reasoning']
          }
        }],
        tool_choice: "auto",
        temperature: 0.7
      }
    };

    // Send initial session update and wait for session ID
    const sessionId = await sendSessionUpdateEvent(ws, initialSessionEvent);
    logger.info('Session initialized', { sessionId });

    // 5. Process chunks incrementally
    const chunkSummaries: string[] = [];
    for (let i = 0; i < limitedChunks.length; i++) {
      const chunk = limitedChunks[i];
      logger.info(`Processing chunk ${i + 1} of ${limitedChunks.length}`);

      // Send chunk for analysis
      const chunkEvent: RequestEvent = {
        type: 'response.create',
        response: {
          modalities: ['text'],
          instructions: `Analyze this Git diff chunk and provide a structured summary:\n\n${chunk}`
        }
      };

      const summary = await sendEventAndAwait(ws, chunkEvent);
      const validatedSummary = parseAndValidateJSON(summary, validateSummary);
      chunkSummaries.push(JSON.stringify(validatedSummary));
      logger.info(`Chunk ${i + 1} processed`);
    }

    // 6. Update session for final version analysis
    const finalSessionEvent: SessionUpdateEvent = {
      type: 'session.update',
      event_id: sessionId,
      session: {
        modalities: ['text'],
        instructions: `
          You are now a version control expert.
          Based on the previous summaries of Git changes, determine the appropriate version bump:
          - Use "patch" for bug fixes and minor improvements
          - Use "minor" for new features that maintain backward compatibility
          - Use "major" for breaking changes

          Analyze the summaries and provide your decision in a structured format.
        `,
        tools: [{
          type: 'function',
          name: 'version_analysis',
          description: 'Analyze version bump based on changes',
          parameters: {
            type: 'object',
            properties: {
              version_type: { type: 'string' },
              needs_review: { type: 'boolean' },
              reasoning: { type: 'string' }
            },
            required: ['version_type', 'needs_review', 'reasoning']
          }
        }],
        tool_choice: "auto",
        temperature: 0.7
      }
    };

    await sendSessionUpdateEvent(ws, finalSessionEvent);

    // 7. Send final analysis request
    const finalAnalysisEvent: RequestEvent = {
      type: 'response.create',
      response: {
        modalities: ['text'],
        instructions: `Based on these summaries, determine the version bump:\n\n${chunkSummaries.join('\n\n')}`
      }
    };

    const finalAnalysis = await sendEventAndAwait(ws, finalAnalysisEvent);
    const result = parseAndValidateJSON(finalAnalysis, validateFinalAnalysis);

    logger.info('✅ Analysis complete', { result });

    // Ensure proper connection cleanup
    return await new Promise((resolve, reject) => {
      const cleanup = () => {
        clearTimeout(closeTimeout);
        if (ws?.readyState === WebSocket.OPEN) {
          // Remove all listeners before closing to prevent race conditions
          ws.removeAllListeners();
          ws.close();
        }
      };

      // Set a timeout for the close operation
      closeTimeout = setTimeout(() => {
        logger.warn('⚠️ WebSocket close timeout - forcing cleanup');
        cleanup();
        resolve(JSON.stringify(result, null, 2));
      }, 5000);

      if (ws?.readyState === WebSocket.OPEN) {
        logger.debug('Initiating graceful WebSocket shutdown');

        // Add close listener after removing all others
        ws.once('close', () => {
          logger.debug('WebSocket closed successfully');
          clearTimeout(closeTimeout);
          resolve(JSON.stringify(result, null, 2));
        });

        ws.once('error', (err) => {
          logger.error('Error during WebSocket shutdown', { error: err });
          cleanup();
          resolve(JSON.stringify(result, null, 2)); // Still resolve as we have the result
        });

        // Close with a more specific code and reason
        ws.close(1000, 'Analysis complete - normal closure');
      } else {
        cleanup();
        resolve(JSON.stringify(result, null, 2));
      }
    });

  } catch (err) {
    logWebSocketState(ws, 'analyzeGitDiffForVersion error');
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error('❌ Fatal error during analysis', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    });
    throw error;
  } finally {
    logWebSocketState(ws, 'analyzeGitDiffForVersion finally');
    if (ws?.readyState === WebSocket.OPEN) {
      try {
        logger.debug('Ensuring WebSocket cleanup in finally block');
        ws.removeAllListeners(); // Remove all listeners before final close
        ws.close(1000, 'Final cleanup');
      } catch (err) {
        logger.warn('Error during final WebSocket cleanup', { error: err });
      }
    }
  }
}

// Add a helper function for WebSocket state logging
function logWebSocketState(ws: WebSocket | null, context: string): void {
  if (!ws) {
    logger.debug(`WebSocket state [${context}]: null`);
    return;
  }

  const states = {
    [WebSocket.CONNECTING]: 'CONNECTING',
    [WebSocket.OPEN]: 'OPEN',
    [WebSocket.CLOSING]: 'CLOSING',
    [WebSocket.CLOSED]: 'CLOSED'
  };

  logger.debug(`WebSocket state [${context}]`, {
    state: states[ws.readyState],
    readyState: ws.readyState
  });
}

/**
 * Optional CLI usage:
 * If you want to run "node dist/tools/@baudevs/release-tools/realtime-version-bump.cjs.js" directly
 * after building with Rollup, you can uncomment below.
 */
// if (require.main === module) {
//   analyzeGitDiffForVersion()
//     .then((result) => {
//       // Possibly write to stdout or file
//       console.log('\nDone.\n', JSON.stringify(result, null, 2));
//       process.exit(0);
//     })
//     .catch((err) => {
//       console.error('Fatal error:', err);
//       process.exit(1);
//     });
// }
