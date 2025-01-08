import { execSync } from 'child_process';
import { createLogger } from '@baudevs/bau-log-hero';

const logger = createLogger({
  name: 'create-version-plan',
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

interface VersionPlanOptions {
  versionType: string;
  projectName: string;
  onlyTouched?: boolean;
}

export async function createVersionPlan(options: VersionPlanOptions): Promise<void> {
  const { versionType, projectName, onlyTouched = false } = options;

  logger.info('Creating version plan', { versionType, projectName, onlyTouched });

  try {
    const command = `pnpm nx release plan ${versionType} --projects=@baudevs/${projectName} --only-touched=${onlyTouched}`;
    logger.info('Running command', { command });

    // Run nx release plan command
    try {
      execSync(command, { stdio: 'inherit' });
    } catch (error) {
      logger.error('Failed to run nx release plan', { error, command });
      throw error;
    }

    // Configure git
    try {
      logger.info('Configuring git');
      execSync('git config --global user.name "baudevs"', { stdio: 'inherit' });
      execSync('git config --global user.email "tech@baudevs.com"', { stdio: 'inherit' });
    } catch (error) {
      logger.error('Failed to configure git', { error });
      throw error;
    }

    // Add and commit version plan
    try {
      logger.info('Committing version plan');
      execSync('git add .nx/version-plans/', { stdio: 'inherit' });
      execSync(`git commit -m "chore(${projectName}): add version plan [skip ci]"`, { stdio: 'inherit' });
      execSync('git push', { stdio: 'inherit' });
    } catch (error) {
      logger.error('Failed to commit version plan', { error });
      throw error;
    }

    logger.info('Version plan created and committed successfully');
  } catch (error) {
    logger.error('Failed to create version plan', { error });
    throw error;
  }
}
