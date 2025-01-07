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
    // Run nx release plan command
    execSync(
      `pnpm nx release plan ${versionType} --projects=@baudevs/${projectName} --only-touched=${onlyTouched}`,
      { stdio: 'inherit' }
    );

    // Configure git
    execSync('git config --global user.name "baudevs"', { stdio: 'inherit' });
    execSync('git config --global user.email "tech@baudevs.com"', { stdio: 'inherit' });

    // Add and commit version plan
    execSync('git add .nx/version-plans/', { stdio: 'inherit' });
    execSync(`git commit -m "chore(${projectName}): add version plan [skip ci]"`, { stdio: 'inherit' });
    execSync('git push', { stdio: 'inherit' });

    logger.info('Version plan created and committed successfully');
  } catch (error) {
    logger.error('Failed to create version plan', { error });
    throw error;
  }
}
