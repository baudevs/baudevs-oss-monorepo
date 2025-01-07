import { analyzeChanges } from './utils/analyze-changes';
import { analyzeGitDiffForVersion, VersionAnalysisResult } from './utils/real-time-version-bump';
import { createLogger } from '@baudevs/bau-log-hero';

const logHero = createLogger('release-tools');

logHero.info('Starting release-tools');

interface AnalyzeOptions {
  /**
   * If true, uses the realtime approach (WebSocket).
   * If false, uses the normal approach (OpenAI ChatCompletion).
   */
  realtime?: boolean;
}

/**
 * Main entry function that decides which analysis method to call.
 */
export async function analyzeChangesNow(options: AnalyzeOptions = {}): Promise<void> {
  try {
    if (options.realtime) {
      logHero.info('Using Realtime API...');
      const result: VersionAnalysisResult = await analyzeGitDiffForVersion();
      logHero.info('Realtime Analysis Result:', JSON.stringify(result, null, 2));
    } else {
      logHero.info('Using Normal API...');
      // If analyzeChanges() returns something, print it here.
      await analyzeChanges();
      // If you want a final structured result from analyzeChanges(),
      // you can modify analyzeChanges() to return an object,
      // then print it here similarly.
    }
  } catch (error) {
    logHero.error('Error analyzing changes:', error);
    process.exit(1);
  }
}

/**
 * Optional: If you want to run this index directly from the CLI,
 * you can parse command-line args and toggle the "realtime" option.
 */
if (import.meta.url === new URL(process.argv[1], 'file://').href) {
  const args = process.argv.slice(2);
  const useRealtime = args.includes('--realtime');
  // If you want to parse other flags, handle them here.

  analyzeChangesNow({ realtime: useRealtime }).catch((err) => {
    logHero.error('Fatal error in analyzeChangesNow:', err);
    process.exit(1);
  });
}
