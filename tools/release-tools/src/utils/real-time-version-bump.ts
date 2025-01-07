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
  output: {
    console: {
      enabled: true,
      truncateJson: {
        enabled: true,
        firstLines: 2,
        lastLines: 2
      }
    },
    ci: {
      enabled: process.env['CI'] === 'true',
      minLevel: 'info',
      filterPatterns: [
        // Key events we want to see
        'Analyzing Git diff',
        'Creating session',
        'Session created:',
        'Processing chunk',
        'Final analysis:',
        'version_type',
        'needs_review',
        'reasoning'
      ],
      showFullObjects: false,
      truncateLength: 150,
      excludeMetadata: true
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
interface ServerEvent {
  type: 'response.partial' | 'response.final' | 'response.done' | 'response.error';
  response?: {
    text?: string;
  };
}

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
 * Interface for potential errors from Realtime API.
 */
interface RealtimeError extends Error {
  message: string;
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

    const onMessage = (data: WebSocket.Data) => {
      try {
        const rawMessage = typeof data === 'string' ? data : data.toString();
        const event = JSON.parse(rawMessage);
        logger.debug('Received event', { type: event.type, event });

        switch (event.type) {
          case 'response.function_call_arguments.delta':
            functionCallArguments += event.delta;
            break;

          case 'response.function_call_arguments.done':
            finished = true;
            resolve(event.arguments);
            break;

          case 'response.partial':
            if (event.response?.text) {
              partialText += event.response.text;
            }
            break;

          case 'response.final':
            if (event.response?.text) {
              partialText += event.response.text;
            }
            break;

          case 'response.done':
            if (!finished) {
              finished = true;
              resolve(partialText);
            }
            break;

          case 'response.error': {
            const error = new Error(`Model error: ${JSON.stringify(event)}`);
            logger.error('WebSocket error response', { event });
            reject(error);
            break;
          }

          case 'response.output_item.done':
            // Handle output item completion if needed
            break;

          default:
            logger.debug('Unhandled event type', { type: event.type });
            break;
        }
      } catch (err) {
        const error = `Failed to parse server event: ${data}`;
        logger.error('WebSocket parse error', { error, data });
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

    function cleanup() {
      logger.debug('Cleaning up WebSocket listeners');
      ws.off('message', onMessage);
      ws.off('close', onClose);
      ws.off('error', onError);
    }

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
      const serializedEvent = JSON.stringify(eventObj);
      logger.debug('Sending WebSocket event', {
        event: eventObj,
        serialized: serializedEvent
      });
      logWebSocketEvent('send', {
        event: eventObj,
        serialized: serializedEvent
      });

      ws.send(serializedEvent);
      waitForFinalResponse(ws).then(response => {
        if (!response.trim()) {
          logger.warn('⚠️ Received empty response from WebSocket');
        }
        resolve(response);
      }).catch(reject);
    } catch (err) {
      logger.error('❌ Error sending WebSocket event', { error: err });
      logError(err);
      reject(err);
    }
  });
}

/**
 * Performs a secondary summarization on large combined summaries.
 * @param ws The WebSocket connection.
 * @param summary The combined summary text.
 * @returns The secondary summarized text.
 */
async function secondarySummarize(ws: WebSocket, summary: string): Promise<string> {
  logger.info('Performing secondary summarization...');

  const secSummaryEvent: RequestEvent = {
    type: 'response.create',
    response: {
      modalities: ['text'],
      instructions: `Summarize the following text in a concise manner:\n\n${summary}`
    }
  };

  logger.debug('Sending secondary summarization request', { event: secSummaryEvent });

  try {
    const secSummary = await sendEventAndAwait(ws, secSummaryEvent);
    logger.info('Secondary summarization complete');
    return secSummary.trim();
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error('❌ Error during secondary summarization', { error });
    ws.close();
    throw error;
  }
}

/**
 * Attempts to send a request and parse JSON with retries.
 * @param ws The WebSocket connection.
 * @param eventObj The request event to send.
 * @param schemaValidator The AJV compiled schema validator.
 * @param maxRetries The maximum number of retry attempts.
 * @returns The parsed JSON object.
 */
async function sendEventWithRetries<T>(
  ws: WebSocket,
  eventObj: RequestEvent,
  schemaValidator: ValidateFunction,
  maxRetries = 3
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const responseText = await sendEventAndAwait(ws, eventObj);
      if (!responseText.trim()) {
        throw new Error('Empty response received from OpenAI Realtime API');
      }
      return parseAndValidateJSON<T>(responseText, schemaValidator);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error(`❌ Attempt ${attempt} failed`, {
        error: error.message,
        attempt,
        maxRetries,
        requestType: eventObj.type
      });

      if (attempt === maxRetries) {
        throw new Error(`All ${maxRetries} attempts failed: ${error.message}`);
      }

      logger.warn(`⚠️ Retrying... (${attempt + 1}/${maxRetries})`);
    }
  }
  throw new Error('Unexpected error in sendEventWithRetries');
}

async function logGitDiff(diff: string): Promise<void> {
  await logger.debug('📄 Git Diff Content', { diff });
}

async function logChunk(chunkIndex: number, content: string): Promise<void> {
  await logger.debug(`🔍 Chunk ${chunkIndex} Content`, { content });
}

async function logChunkSummary(chunkIndex: number, summary: string): Promise<void> {
  await logger.info(`📝 Chunk ${chunkIndex} Summary`, { summary });
}

async function logWebSocketEvent(eventType: string, content: unknown): Promise<void> {
  await logger.debug(`🔌 WebSocket Event: ${eventType}`, { content });
}

async function logFinalAnalysis(analysis: unknown): Promise<void> {
  await logger.info('✅ Final Analysis', { analysis });
}

async function logError(error: Error | unknown): Promise<void> {
  if (error instanceof Error) {
    await logger.error('❌ Error occurred', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    });
  } else {
    await logger.error('❌ Unknown error occurred', { error });
  }
}

async function setupWebSocketListeners(ws: WebSocket): Promise<string> {
  return new Promise((resolve, reject) => {
    let sessionId: string | null = null;

    const onMessage = (data: WebSocket.Data) => {
      try {
        const rawMessage = typeof data === 'string' ? data : data.toString();
        logger.debug('Raw WebSocket message received', { data: rawMessage });

        const event = JSON.parse(rawMessage);
        logger.debug('Parsed WebSocket event', { event });

        switch (event.type) {
          case 'session.created':
            sessionId = event.session.id;
            logger.info('Session created', { sessionId });
            break;

          case 'session.updated':
            sessionId = event.session.id;
            logger.info('Session updated', { sessionId });
            if (sessionId) {
              resolve(sessionId);
            }
            break;

          case 'response.partial':
            if (event.response?.text) {
              logger.debug('Partial response received', {
                text: event.response.text,
                sessionId
              });
            }
            break;

          case 'response.final':
            if (event.response?.text) {
              logger.debug('Final response received', {
                text: event.response.text,
                sessionId
              });
            }
            break;

          case 'response.done':
            logger.debug('Done response received', { sessionId });
            break;

          case 'response.error': {
            const error = new Error(`Model error: ${JSON.stringify(event)}`);
            logger.error('WebSocket error response', { event });
            reject(error);
            break;
          }

          default:
            logger.debug('Received event', { type: event.type, event });
            break;
        }
      } catch (err) {
        const error = `Failed to parse server event: ${data}`;
        logger.error('WebSocket parse error', { error, data });
        reject(new Error(error));
      }
    };

    const onError = (err: Error) => {
      logger.error('WebSocket error', { error: err });
      reject(err);
    };

    const onClose = () => {
      if (!sessionId) {
        logger.warn('WebSocket closed before session was established');
        reject(new Error('WebSocket closed before session was established'));
      }
    };

    ws.on('message', onMessage);
    ws.on('error', onError);
    ws.on('close', onClose);
  });
}

export async function analyzeGitDiffForVersion(): Promise<string> {
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
  const ws = createRealtimeConnection();

  // Wait for connection
  await new Promise<void>((resolve, reject) => {
    ws.once('open', resolve);
    ws.once('error', reject);
  });

  try {
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

    logger.info('Analysis complete', { result });
    return JSON.stringify(result);

  } finally {
    ws.close();
  }
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
