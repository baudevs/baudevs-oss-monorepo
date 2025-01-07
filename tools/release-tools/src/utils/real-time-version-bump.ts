import WebSocket from 'ws';
import Ajv, { ValidateFunction } from 'ajv';
import { getFilteredGitDiff } from './git-diff-filter';
import { chunkString, limitChunks } from './chunk-helpers';


/**
 * Make sure you've set OPENAI_API_KEY in your environment
 * or in GitHub Actions secrets.
 */
const OPENAI_API_KEY = process.env['OPENAI_API_KEY'] || '';

if (!OPENAI_API_KEY) {
  console.error('ERROR: Missing OPENAI_API_KEY environment variable.');
  process.exit(1);
}

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

const summarySchema = {
  type: 'object',
  properties: {
    summary: { type: 'string' }
  },
  required: ['summary'],
  additionalProperties: true
};

const finalAnalysisSchema = {
  type: 'object',
  properties: {
    version_type: { type: 'string', enum: ['patch', 'minor', 'major', 'unknown'] },
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
    let partialText = '';
    let finished = false;

    const onMessage = (data: WebSocket.Data) => {
      let serverEvent: ServerEvent;

      try {
        const message = typeof data === 'string' ? data : data.toString();
        console.log('Received message:', message);
        serverEvent = JSON.parse(message);
      } catch {
        console.error('Failed to parse server event:', data);
        return;
      }

      switch (serverEvent.type) {
        case 'response.partial':
          if (serverEvent.response?.text) {
            partialText += serverEvent.response.text;
            console.log('Partial text:', partialText);
          }
          break;

        case 'response.final':
          if (serverEvent.response?.text) {
            partialText += serverEvent.response.text;
            console.log('Final text:', partialText);
          }
          finished = true;
          cleanup();
          resolve(partialText);
          break;

        case 'response.done':
          // Some models send "done" with no additional text
          finished = true;
          cleanup();
          resolve(partialText);
          break;

        case 'response.error':
          finished = true;
          cleanup();
          reject(new Error(`Model error: ${JSON.stringify(serverEvent)}`));
          break;

        default:
          // Possibly partial tokens or other event types
          break;
      }
    };

    const onClose = () => {
      if (!finished) {
        cleanup();
        reject(new Error('WebSocket closed before final response.'));
      }
    };

    const onError = (err: Error) => {
      cleanup();
      reject(err);
    };

    function cleanup() {
      ws.off('message', onMessage);
      ws.off('close', onClose);
      ws.off('error', onError);
    }

    ws.on('message', onMessage);
    ws.on('close', onClose);
    ws.on('error', onError);
  });
}

/**
 * Send one "response.create" event to the Realtime model,
 * and wait for the final text using `waitForFinalResponse()`.
 */
async function sendEventAndAwait(ws: WebSocket, eventObj: RequestEvent): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      console.log('Sending event:', JSON.stringify(eventObj, null, 2));
      ws.send(JSON.stringify(eventObj));
      waitForFinalResponse(ws).then(resolve).catch(reject);
    } catch (err) {
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
  console.log('Performing secondary summarization...');

  const secSummaryEvent: RequestEvent = {
    type: 'response.create',
    response: {
      modalities: ['text'],
      instructions: `Summarize the following text in a concise manner:\n\n${summary}`
    }
  };

  console.log('Sending secondary summarization request:', JSON.stringify(secSummaryEvent, null, 2));

  try {
    const secSummary = await sendEventAndAwait(ws, secSummaryEvent);
    console.log('Secondary summarization complete.');
    return secSummary.trim();
  } catch (err: unknown) {
    const error = err as RealtimeError;
    console.error('Error during secondary summarization:', error.message || error);
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
        throw new Error('Empty response received.');
      }
      return parseAndValidateJSON<T>(responseText, schemaValidator);
    } catch (err: unknown) {
      const error = err as RealtimeError;
      console.error(`Attempt ${attempt} failed:`, error.message || error);
      if (attempt === maxRetries) {
        throw new Error(`All ${maxRetries} attempts failed.`);
      }
      console.log(`Retrying... (${attempt + 1}/${maxRetries})`);
    }
  }
  throw new Error('Unexpected error in sendEventWithRetries.');
}

/**
 * Analyze the Git diff using the Realtime API.
 * @returns The version analysis result.
 */
export async function analyzeGitDiffForVersion(): Promise<VersionAnalysisResult> {
  // 1. Get the filtered Git diff
  const diff = await getFilteredGitDiff();
  console.info('Filtered Git diff:', diff);
  if (!diff) {
    console.info('No relevant changes found in the Git diff.');
    return {
      version_type: 'unknown',
      needs_review: false,
      reasoning: 'No relevant changes detected.',
    };
  }

  // 2. Chunk the diff
  const rawChunks = chunkString(diff, CHUNK_SIZE);
  const limitedChunks = limitChunks(rawChunks, MAX_CHUNKS);
  console.log(`Sending ${limitedChunks.length} chunk(s) to OpenAI Realtime API for summarization.`);

  // 3. Connect to Realtime API
  const ws = createRealtimeConnection();

  // Wait for the connection to open
  await new Promise<void>((resolve, reject) => {
    ws.once('open', () => {
      resolve();
    });
    ws.once('error', (err) => {
      reject(err);
    });
  });

  console.log('Connected to Realtime API.');

  const chunkSummaries: string[] = [];

  // 4. Summarize each chunk
  for (let i = 0; i < limitedChunks.length; i++) {
    const chunk = limitedChunks[i];
    console.log(`Summarizing chunk ${i + 1} of ${limitedChunks.length}...`);

    const summaryEvent: RequestEvent = {
      type: 'response.create',
      response: {
        modalities: ['text'],
        instructions: `
          Summarize the following Git diff chunk in a concise, developer-focused manner.
          Focus on breaking changes, new features, and bug fixes.
          Format your response as a JSON object with the structure: {"summary": "Your summarized text here."}

          Git Diff Chunk:
          ${chunk}
        `
      }
    };

    try {
      console.log(`Sending chunk ${i + 1} summary request.`);
      const summary = await sendEventWithRetries<{ summary: string }>(
        ws,
        summaryEvent,
        validateSummary,
        3 // Number of retries
      );
      if (!summary.summary.trim()) {
        console.warn(`⚠️ Chunk ${i + 1} returned an empty summary.`);
      } else {
        chunkSummaries.push(summary.summary.trim());
        console.log(`✔ Chunk ${i + 1} summarized.`);
      }
    } catch (err: unknown) {
      const error = err as RealtimeError;
      console.error(`Error summarizing chunk ${i + 1}:`, error.message || error);
      ws.close();
      throw error;
    }
  }

  // 5. Combine summaries
  let combinedSummary = chunkSummaries.join('\n\n');
  console.log('All chunks summarized. Checking combined summary size...');

  // 6. If combined summary is too large, perform secondary summarization
  const MAX_SUMMARY_LENGTH = 5000; // Adjust based on OpenAI token limits

  if (combinedSummary.length > MAX_SUMMARY_LENGTH) {
    console.log(`Combined summary length (${combinedSummary.length}) exceeds ${MAX_SUMMARY_LENGTH}. Performing secondary summarization.`);
    combinedSummary = await secondarySummarize(ws, combinedSummary);
    console.log('Secondary summarization complete.');
  } else {
    console.log('Combined summary is within acceptable length.');
  }

  // 7. Final version analysis request with retries
  const finalEvent: RequestEvent = {
    type: 'response.create',
    response: {
      modalities: ['text'],
      instructions: `
        Based on the following summarized Git changes, determine the appropriate version bump:
          - "patch" for bug fixes or small improvements
          - "minor" for new features that do not break backward compatibility
          - "major" for breaking changes

        Provide detailed reasoning and indicate if a human review is needed.
        Format your response as JSON with the structure:
        {
          "version_type": "minor",
          "needs_review": false,
          "reasoning": "Added new authentication feature without breaking existing endpoints."
        }

        Summaries:
        ${combinedSummary}
      `
    }
  };

  console.log('Sending final version analysis request.');
  console.log('Final Event:', JSON.stringify(finalEvent, null, 2));

  let parsed: VersionAnalysisResult;
  try {
    parsed = await sendEventWithRetries<VersionAnalysisResult>(
      ws,
      finalEvent,
      validateFinalAnalysis,
      3 // Number of retries
    );
  } catch (err: unknown) {
    const error = err as RealtimeError;
    console.error('Error during final version analysis:', error.message || error);
    ws.close();
    throw error;
  }

  // 8. Close the WebSocket connection
  ws.close();

  // 9. Log and return the final analysis
  console.log('\nFinal Version Analysis:\n', JSON.stringify(parsed, null, 2));
  return parsed;
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
