import OpenAI from 'openai';
import type { IncomingMessage, ServerResponse } from 'http';
import { execSync } from 'child_process';

interface AISummaryRequest {
  prompt: string;
}

interface ExtendedRequest extends IncomingMessage {
  body?: AISummaryRequest;
}

async function getOpenAIKey(): Promise<string> {
  try {
    // If key is directly set in env (GitHub Actions), use it
    if (process.env.VITE_OPENAI_API_KEY) {
      return process.env.VITE_OPENAI_API_KEY;
    }

    // Otherwise, try to get it from 1Password CLI
    const key = execSync('op read "op://BauDevs/OpenAI/credential"', { encoding: 'utf-8' }).trim();
    return key;
  } catch (error) {
    console.error('Failed to get OpenAI API key:', error);
    throw new Error('Failed to get OpenAI API key');
  }
}

let openai: OpenAI;

export async function aiSummaryHandler(req: ExtendedRequest, res: ServerResponse) {
  try {
    // Initialize OpenAI client if not already done
    if (!openai) {
      const apiKey = await getOpenAIKey();
      openai = new OpenAI({ apiKey });
    }

    if (!req.body?.prompt) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'No prompt provided' }));
      return;
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a monorepo expert analyzing changes between versions. Focus on providing actionable insights and clear explanations of the changes impact.'
        },
        {
          role: 'user',
          content: req.body.prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const summary = completion.choices[0]?.message?.content || 'No summary generated';

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ summary }));
  } catch (error) {
    console.error('AI Summary error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: 'Failed to generate summary',
      details: error instanceof Error ? error.message : 'Unknown error'
    }));
  }
}
