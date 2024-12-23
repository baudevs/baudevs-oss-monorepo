import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

export interface ProjectStructure {
  usesSrcDirectory: boolean;
  usesAppRouter: boolean;
  usesI18n: {
    enabled: boolean;
    library?: 'next-intl' | 'next-i18next' | 'other';
  };
  existingMiddleware: {
    exists: boolean;
    path?: string;
    content?: string;
  };
  packageManager: 'npm' | 'yarn' | 'pnpm' | 'bun';
  nextConfig: {
    path: string;
    content: string;
    hasExportedConfig: boolean;
  };
}

export async function analyzeProject(projectPath: string = process.cwd()): Promise<ProjectStructure> {
  const structure: ProjectStructure = {
    usesSrcDirectory: false,
    usesAppRouter: false,
    usesI18n: {
      enabled: false
    },
    existingMiddleware: {
      exists: false
    },
    packageManager: 'npm',
    nextConfig: {
      path: '',
      content: '',
      hasExportedConfig: false
    }
  };

  // Check src directory usage
  structure.usesSrcDirectory = existsSync(join(projectPath, 'src'));

  // Check app router usage
  const appDir = structure.usesSrcDirectory ? join(projectPath, 'src', 'app') : join(projectPath, 'app');
  structure.usesAppRouter = existsSync(appDir);

  // Detect package manager
  if (existsSync(join(projectPath, 'bun.lockb'))) {
    structure.packageManager = 'bun';
  } else if (existsSync(join(projectPath, 'yarn.lock'))) {
    structure.packageManager = 'yarn';
  } else if (existsSync(join(projectPath, 'pnpm-lock.yaml'))) {
    structure.packageManager = 'pnpm';
  }

  // Check for i18n configuration
  try {
    const packageJson = JSON.parse(readFileSync(join(projectPath, 'package.json'), 'utf-8'));
    if (packageJson.dependencies['next-intl']) {
      structure.usesI18n = { enabled: true, library: 'next-intl' };
    } else if (packageJson.dependencies['next-i18next']) {
      structure.usesI18n = { enabled: true, library: 'next-i18next' };
    }
  } catch (error) {
    console.warn('Could not read package.json');
  }

  // Check for existing middleware
  const middlewarePaths = [
    join(projectPath, 'middleware.ts'),
    join(projectPath, 'middleware.js'),
    join(projectPath, 'src', 'middleware.ts'),
    join(projectPath, 'src', 'middleware.js')
  ];

  for (const path of middlewarePaths) {
    if (existsSync(path)) {
      structure.existingMiddleware = {
        exists: true,
        path,
        content: readFileSync(path, 'utf-8')
      };
      break;
    }
  }

  // Check Next.js config
  const nextConfigPaths = [
    'next.config.js',
    'next.config.mjs',
    'next.config.ts',
    'next.config.mts'
  ].map(file => join(projectPath, file));

  for (const path of nextConfigPaths) {
    if (existsSync(path)) {
      const content = readFileSync(path, 'utf-8');
      structure.nextConfig = {
        path,
        content,
        hasExportedConfig: content.includes('module.exports') || content.includes('export default')
      };
      break;
    }
  }

  return structure;
} 