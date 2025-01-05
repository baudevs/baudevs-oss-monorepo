import { OpenAI } from 'openai';
import { execSync } from 'child_process';

export interface AnalysisResponse {
  version_type: 'patch' | 'minor' | 'major' | 'unknown';
  needs_review: boolean;
  reasoning: string;
}

export async function analyzeChanges(diff?: string): Promise<AnalysisResponse> {
  try {
    // Get git diff
    diff = diff || execSync('git diff').toString();

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env['OPENAI_API_KEY'],
    });

    // Create chat completion
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-1106-preview',
      messages: [
        {
          role: 'system',
          content: `As a senior developer, analyze this Git diff and determine the appropriate version bump type (patch, minor, or major).
            Consider:
            1. Breaking changes (major):
               - API modifications that break backward compatibility
               - Removal of public methods/properties
               - Major dependency updates with breaking changes

            2. New features (minor):
               - New functionality that maintains backward compatibility
               - New public methods/properties
               - Non-breaking dependency updates

            3. Bug fixes (patch):
               - Bug fixes that don't change the API
               - Documentation updates
               - Internal refactoring

            If you're not confident about the version type, indicate that human review is needed.

            Respond in JSON format:
            {
              "version_type": "patch|minor|major|unknown",
              "needs_review": true|false,
              "reasoning": "detailed explanation"
            }`
        },
        {
          role: 'user',
          content: `Git Diff:\n${diff}`
        }
      ],
      response_format: { type: 'json_object' }
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No response content from OpenAI');
    }

    const response = JSON.parse(content) as AnalysisResponse;

    // Set GitHub outputs
    console.log(`::set-output name=version_type::${response.version_type}`);
    console.log(`::set-output name=needs_review::${response.needs_review}`);
    console.log(`::set-output name=reasoning::${response.reasoning}`);

    return response;

  } catch (error) {
    console.error('Error analyzing changes:', error);
    process.exit(1);
  }
}
