// utils/analyze-changes.ts

import OpenAI from "openai";
import { spawn } from "child_process";

/**
 * Initialize the OpenAI client with your API key.
 * Ensure process.env.OPENAI_API_KEY is set in your CI environment.
 */
const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
});

// Arbitrary chunk size. Adjust to keep each chunk small enough to avoid huge token usage.
const CHUNK_SIZE = 6000;

/**
 * Splits a long string (the diff) into multiple chunks.
 */
function chunkString(str: string, size: number): string[] {
  const chunks: string[] = [];
  let offset = 0;
  while (offset < str.length) {
    chunks.push(str.slice(offset, offset + size));
    offset += size;
  }
  return chunks;
}

/**
 * Summarizes a single chunk of the diff via a short, non-streaming request.
 * Note that we only use the `user` role, since o1-mini doesn't support `system`.
 */
async function summarizeDiffChunk(chunk: string): Promise<string> {
  // For o1-mini, watch your token usage carefully (max_tokens, chunk size, etc.).
  const response = await openai.chat.completions.create({
    model: "o1-mini",
    // Only a single user message here (no system role).
    messages: [
      {
        role: "user",
        content: `
          Please summarize the following Git diff chunk in a concise way,
          capturing only the most important changes:
          \n\n${chunk}
        `,
      },
    ],
    // Keep max_tokens small to avoid large responses for each chunk.
    max_completion_tokens: 512,
  });

  // Return the summarized content (defaulting to empty string if something is off).
  return response.choices?.[0]?.message?.content?.trim() || "";
}

/**
 * Main function that:
 * 1. Streams the Git diff
 * 2. Splits it into chunks (if large)
 * 3. Summarizes each chunk
 * 4. Does a final function call (streaming) for version analysis
 */
export async function analyzeChanges(): Promise<void> {
  try {
    console.log("Streaming Git diff...");
    const diffStream = getGitDiffStream();

    let diffBuffer = ""; // Accumulate the entire Git diff
    for await (const chunk of diffStream) {
      diffBuffer += chunk;
    }

    if (!diffBuffer) {
      throw new Error("Git diff is empty. Ensure there are changes to analyze.");
    }

    // Break the raw diff into multiple chunks if needed.
    const chunks = chunkString(diffBuffer, CHUNK_SIZE);

    // If only one chunk, just analyze it directly; else summarize each chunk.
    let finalDiffForAnalysis: string;

    if (chunks.length === 1) {
      finalDiffForAnalysis = chunks[0];
    } else {
      console.log(`Diff is large, splitting into ${chunks.length} chunks. Summarizing each...`);
      const summaries: string[] = [];

      for (const [index, chunk] of chunks.entries()) {
        console.log(`Summarizing chunk ${index + 1} of ${chunks.length}...`);
        const summary = await summarizeDiffChunk(chunk);
        summaries.push(summary);
      }
      // Combine all chunk summaries into a single text block for final analysis
      finalDiffForAnalysis = summaries.join("\n\n");
    }

    console.log("Starting OpenAI streaming analysis...");

    // Now call the final analysis as a function call, with streaming
    //
    // NOTE: If o1-mini also doesn't allow function calls or streaming, remove
    // `functions`, `function_call`, and `stream: true`. Then just do a normal .create() call
    // with a single user message, then parse the text from response.choices[0].message?.content.
    const completionStream = await openai.chat.completions.create({
      model: "o1-mini",
      // Use only user role for instructions to avoid "system not supported".
      messages: [
        {
          role: "user",
          content: `
            You are a senior developer. Analyze the following Git diff (or summary):
            \n${finalDiffForAnalysis}\n
            Then decide the appropriate version bump type: "patch", "minor", or "major".
            Also explain your reasoning, and indicate whether a human review is needed.

            Please return a JSON object by calling the function "analysis_response" with these fields:
            - version_type (patch, minor, major, or unknown)
            - needs_review (boolean)
            - reasoning (string)
            Respond in small increments.
          `,
        },
      ],
      functions: [
        {
          name: "analysis_response",
          description: "Analyze a Git diff and return version bump information.",
          parameters: {
            type: "object",
            properties: {
              version_type: {
                type: "string",
                description:
                  "Type of version bump: 'patch', 'minor', 'major', or 'unknown'.",
                enum: ["patch", "minor", "major", "unknown"],
              },
              needs_review: {
                type: "boolean",
                description: "Whether a human review is needed.",
              },
              reasoning: {
                type: "string",
                description: "Detailed reasoning for the version type.",
              },
            },
            required: ["version_type", "needs_review", "reasoning"],
            additionalProperties: false,
          },
        },
      ],
      function_call: { name: "analysis_response" },
      stream: true, // Enable streaming for incremental response (if supported)
    });

    let finalResponse = "";
    // Collect the function_call arguments from the streaming chunks
    for await (const chunk of completionStream) {
      if (chunk.choices?.[0]?.delta?.function_call?.arguments) {
        const deltaContent = chunk.choices[0].delta.function_call.arguments;
        process.stdout.write(deltaContent); // Print partial text to console
        finalResponse += deltaContent;
      }
    }

    console.log("\n\nFinal Response (parsed JSON):");
    const parsedResponse = JSON.parse(finalResponse);
    console.log(parsedResponse);

  } catch (error) {
    console.error("Error analyzing Git diff:", error);
    process.exit(1);
  }
}

/**
 * Returns an AsyncIterable<string> to read the Git diff incrementally.
 * By default, it compares "origin/main...HEAD". Adjust if needed.
 */
function getGitDiffStream(): AsyncIterable<string> {
  const gitDiff = spawn("git", ["diff", "origin/main...HEAD"]);

  const stdoutStream = gitDiff.stdout;
  const stderrStream = gitDiff.stderr;

  return {
    async *[Symbol.asyncIterator]() {
      for await (const chunk of stdoutStream) {
        yield chunk.toString();
      }
      for await (const chunk of stderrStream) {
        throw new Error(`Git diff error: ${chunk.toString()}`);
      }
      const exitCode = await new Promise<number>((resolve) =>
        gitDiff.on("close", resolve)
      );
      if (exitCode !== 0) {
        throw new Error(`Git diff process exited with code ${exitCode}`);
      }
    },
  };
}
