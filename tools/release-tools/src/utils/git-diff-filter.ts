// tools/release-tools/src/utils/git-diff-filter.ts

import { spawn } from 'child_process';
import { minimatch } from 'minimatch';
import { createLogger } from '@baudevs/bau-log-hero';

const logger = createLogger({
  name: 'git-diff-filter',
  output: {
    console: false,
    file: {
      enabled: true,
      path: './logs/git-diff',
      format: 'text'
    }
  }
});

/**
 * Filters out irrelevant files from the Git diff based on predefined patterns.
 * @param diff The raw Git diff string.
 * @returns The filtered Git diff string.
 */
export function filterGitDiff(diff: string): string {
  const irrelevantFilePatterns = [
    '**/*.md',                // Markdown files
    '**/*.yml', '**/*.yaml',  // YAML configuration files
    '**/test/**',             // Test directories
    '**/__tests__/**',        // Test directories
    '**/*.spec.ts', '**/*.test.ts', // Test files
    '**/.github/**',          // GitHub workflows and configs
    '**/docs/**',             // Documentation
    '**/worktree/**',         // Worktree directories,
    '**/worktrees/**',         // Worktrees directories,
    '**/*.lock',              // Lock files
    '**/*.svg', '**/*.png', '**/*.jpg', // Images
    '**/dist/**',             // Build directories
  ];

  const relevantLines = diff.split('\n').filter(line => {
    if (line.startsWith('diff --git a/')) {
      const filePath = line.split(' ')[2].substring(2); // Remove 'a/' prefix
      // Check if the file matches any irrelevant patterns
      const isRelevant = !irrelevantFilePatterns.some(pattern => minimatch(filePath, pattern));
      if (isRelevant) {
        logger.debug('Including file:', { file: filePath });
      } else {
        logger.debug('Filtering out file:', { file: filePath });
      }
      return isRelevant;
    }
    return true; // Keep all other lines (added, removed, context lines)
  });

  const filteredDiff = relevantLines.join('\n');
  logger.info('Filtered diff created', { length: filteredDiff.length });
  logger.debug('Writing filtered diff to log file');

  // Log the filtered diff to a file
  logger.info('filtered-diff', { diff: filteredDiff });

  return filteredDiff;
}

/**
 * Runs `git diff origin/main...HEAD` and returns the filtered diff as a string.
 */
export const included_paths = [
  'libs/',
  'packages/',
  'tools/',
  './package.json',
  './tsconfig.base.json',
  './workspace.json',
  './nx.json',
  './scripts/',
];
export async function getFilteredGitDiff(): Promise<string> {
  return new Promise((resolve, reject) => {
    const gitDiff = spawn('git', ['diff', 'origin/main...HEAD', '--', ...included_paths]);

    let diffBuffer = '';
    let errorBuffer = '';

    gitDiff.stdout.on('data', (data) => {
      diffBuffer += data.toString();
    });

    gitDiff.stderr.on('data', (err) => {
      errorBuffer += err.toString();
    });

    gitDiff.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`git diff exited with code ${code}: ${errorBuffer}`));
      } else {
        const filteredDiff = filterGitDiff(diffBuffer);
        resolve(filteredDiff.trim());
      }
    });
  });
}
