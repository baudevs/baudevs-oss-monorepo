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

  if (!projectName) {
    throw new Error('Project name is required but was empty');
  }

  if (!versionType) {
    throw new Error('Version type is required but was empty');
  }

  logger.info('Creating version plan', { versionType, projectName, onlyTouched });

  try {
    // Ensure we're in the right directory
    const cwd = process.cwd();
    logger.debug('Current working directory', { cwd });

    // Ensure project name has @baudevs/ prefix but not duplicated
    const normalizedProjectName = projectName.startsWith('@baudevs/') ? projectName : `@baudevs/${projectName}`;
    const command = `pnpm nx release plan ${versionType} --projects=${normalizedProjectName} --only-touched=${onlyTouched}`;
    logger.info('Running command', { command });

    // Run nx release plan command
    try {
      logger.debug('Executing nx release plan command');
      execSync(command, {
        stdio: 'inherit',
        encoding: 'utf-8',
        maxBuffer: 10 * 1024 * 1024 // 10MB buffer
      });
      logger.debug('nx release plan command completed successfully');
    } catch (error) {
      const errorObj = error as Error & { status?: number, stderr?: string };
      logger.error('Failed to run nx release plan', {
        error: {
          message: errorObj.message,
          status: errorObj.status,
          stderr: errorObj.stderr
        },
        command,
        cwd: process.cwd(),
        env: {
          PATH: process.env['PATH'],
          NODE_ENV: process.env['NODE_ENV'],
          CI: process.env['CI']
        }
      });
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
