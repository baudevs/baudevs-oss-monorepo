import { analyzeChanges } from './utils/analyze-changes';
import { analyzeGitDiffForVersion, VersionAnalysisResult } from './utils/real-time-version-bump';
import { createLogger } from '@baudevs/bau-log-hero';

// Create a robust logger with both console and file output
const logHero = createLogger({
  name: 'release-tools',
  level: 'debug',
  output: {
    console: {
      enabled: true,
      truncateJson: {
        enabled: true,
        firstLines: 4,
        lastLines: 4
      }
    },
    file: {
      enabled: true,
      path: './logs/release-tools/main',
      format: 'json',
      rotation: {
        enabled: true,
        maxSize: 5 * 1024 * 1024, // 5MB
        maxFiles: 5,
        compress: true
      }
    },
    prettyPrint: true,
    maxDepth: 5
  }
});

// Log startup information
logHero.info('🚀 Release Tools Starting', {
  version: '0.0.1',
  environment: process.env['NODE_ENV'] || 'development',
  timestamp: new Date().toISOString()
});

interface AnalyzeOptions {
  /**
   * If true, uses the realtime approach (WebSocket).
   * If false, uses the normal approach (OpenAI ChatCompletion).
   */
  realtime?: boolean;
}

async function analyzeChangesNow(options: AnalyzeOptions = {}): Promise<void> {
  try {
    if (options.realtime) {
      logHero.info('🔄 Starting Realtime API analysis');
      const result: VersionAnalysisResult = await analyzeGitDiffForVersion();
      logHero.info('✅ Analysis complete', { result });
    } else {
      logHero.info('🔄 Starting Standard API analysis');
      await analyzeChanges();
      logHero.info('✅ Analysis complete');
    }
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    logHero.error('❌ Error analyzing changes', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    });
    process.exit(1);
  }
}

// Handle CLI execution
if (import.meta.url === new URL(process.argv[1], 'file://').href) {
  const args = process.argv.slice(2);
  const useRealtime = args.includes('--realtime');

  logHero.info('🛠️ Processing CLI arguments', {
    args,
    useRealtime,
    command: useRealtime ? 'realtime' : 'standard'
  });

  analyzeChangesNow({ realtime: useRealtime }).catch((err) => {
    const error = err instanceof Error ? err : new Error(String(err));
    logHero.error('❌ Fatal error in analyzeChangesNow', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    });
    process.exit(1);
  });
}
