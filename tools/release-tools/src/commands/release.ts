import { execSync } from 'child_process';
import { createLogger } from '@baudevs/bau-log-hero';

const logger = createLogger({
  name: 'release',
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

interface ReleaseOptions {
  projectName: string;
  skipPublish?: boolean;
}

export async function release(options: ReleaseOptions): Promise<void> {
  const { projectName, skipPublish = false } = options;

  logger.info('Starting release process', { projectName, skipPublish });

  try {
    // Set SHAs for affected commands
    // logger.info('Setting SHAs for affected commands');
    // execSync('pnpm nx set-shas', { stdio: 'inherit' });

    // Run lint and build on affected projects
    // const excludedProjects = process.env['NX_EXCLUDED_PROJECTS'] || '';
    // logger.info('Running lint and build', { excludedProjects });

    // execSync(`pnpm nx affected --target=lint --exclude=${excludedProjects}`, { stdio: 'inherit' });
    // execSync(`pnpm nx affected --target=build --exclude=${excludedProjects}`, { stdio: 'inherit' });
    execSync(`pnpm nx ${projectName} --target=build`, { stdio: 'inherit' });
    // Execute release
    logger.info('Executing release', { projectName });
    execSync(`pnpm nx release ${projectName} --skip-publish`, { stdio: 'inherit' });

    // Publish if not skipped
    if (!skipPublish) {
      logger.info('Publishing package', { projectName });
      execSync(`pnpm nx release publish ${projectName}`, { stdio: 'inherit' });
    }

    logger.info('Release completed successfully');
  } catch (error) {
    logger.error('Failed to release', { error });
    throw error;
  }
}
