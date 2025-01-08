import { createLogger } from '@baudevs/bau-log-hero';
import { analyzeGitDiffForVersion } from './utils/real-time-version-bump';
import { createVersionPlan } from './commands/create-version-plan';
import { release } from './commands/release';

const logger = createLogger({
  name: 'release-tools-cli',
  level: 'info',
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
      showFullObjects: false,
      truncateLength: 150,
      excludeMetadata: true
    }
  }
});

interface CommandOptions {
  command: string;
  projectName?: string;
  versionType?: string;
  skipPublish?: boolean;
  onlyTouched?: boolean;
}

function parseArgs(): CommandOptions {
  const args = process.argv.slice(2);
  const command = args[0] || 'analyze';
  const options: CommandOptions = { command };

  // Convert array arguments to key-value pairs for easier parsing
  const argPairs: Record<string, string> = {};
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const value = args[i + 1];
      if (value && !value.startsWith('--')) {
        argPairs[arg] = value;
        i++; // Skip the value in next iteration
      } else {
        argPairs[arg] = 'true';
      }
    }
  }

  logger.debug('Raw arguments', { args, argPairs });

  // Parse project name
  if (argPairs['--project']) {
    options.projectName = argPairs['--project'].split('@')[0];
  }

  // Parse version type
  if (argPairs['--version-type']) {
    options.versionType = argPairs['--version-type'];
  }

  // Parse only-touched
  if ('--only-touched' in argPairs) {
    options.onlyTouched = argPairs['--only-touched'] === 'true';
  }

  // Parse skip-publish
  if ('--skip-publish' in argPairs) {
    options.skipPublish = true;
  }

  logger.debug('Parsed arguments', { options });
  return options;
}

async function main() {
  try {
    const options = parseArgs();
    logger.info('Starting command', { options });

    let result: string;
    switch (options.command) {
      case 'analyze':
        result = await analyzeGitDiffForVersion();
        if (process.env['GITHUB_OUTPUT']) {
          const fs = await import('fs');
          const resultObj = JSON.parse(result);
          const { version_type, needs_review, reasoning } = resultObj;

          logger.info('Analysis result', { version_type, needs_review, reasoning });

          fs.appendFileSync(process.env['GITHUB_OUTPUT'], `version_type=${version_type}\n`);
          fs.appendFileSync(process.env['GITHUB_OUTPUT'], `needs_review=${needs_review}\n`);
          fs.appendFileSync(process.env['GITHUB_OUTPUT'], `reasoning=${reasoning}\n`);

          logger.info('Wrote outputs to GITHUB_OUTPUT');
        } else {
          console.log(result);
        }
        break;

      case 'create-version-plan':
        if (!options.projectName || !options.versionType) {
          throw new Error('Missing required arguments: --project and --version-type');
        }
        await createVersionPlan({
          projectName: options.projectName,
          versionType: options.versionType,
          onlyTouched: options.onlyTouched
        });
        break;

      case 'release':
        if (!options.projectName) {
          throw new Error('Missing required argument: --project');
        }
        await release({
          projectName: options.projectName,
          skipPublish: options.skipPublish
        });
        break;

      default:
        throw new Error(`Unknown command: ${options.command}`);
    }
  } catch (error) {
    logger.error('Command failed', { error: error instanceof Error ? error.message : error });
    process.exit(1);
  }
}

main();
