import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { mkdir, writeFile, readFile } from 'fs/promises';
import { join } from 'path';
import { analyzeProject, type ProjectStructure } from '../utils/project-analyzer';
import { BackupManager } from '../utils/backup-manager';

interface SetupAnswers {
  databaseType: 'local' | 'turso';
  databasePath?: string;
  tursoUrl?: string;
  tursoAuthToken?: string;
  setupAuth: boolean;
  setupAdminUI: boolean;
  selectedTemplates: ('page' | 'blog-post' | 'service' | 'product')[];
  i18n: boolean;
  i18nLibrary?: 'next-intl' | 'next-i18next';
  enforceStructure: boolean;
}

interface InitOptions {
  yes?: boolean;
  dir?: string;
}

async function validateProjectStructure(projectStructure: ProjectStructure): Promise<string[]> {
  const issues: string[] = [];

  if (!projectStructure.usesAppRouter) {
    issues.push('BauCMS requires Next.js App Router. Please migrate your project to use the App Router.');
  }

  if (projectStructure.nextConfig.path && projectStructure.nextConfig.content) {
    if (!projectStructure.nextConfig.content.includes('experimental: {')) {
      issues.push('Next.js experimental features might be required for some BauCMS features.');
    }
  }

  return issues;
}

async function setupProjectStructure(projectPath: string, structure: ProjectStructure) {
  // Ensure src directory exists
  const srcDir = join(projectPath, 'src');
  if (!structure.usesSrcDirectory) {
    await mkdir(srcDir, { recursive: true });

    // Move app directory if it exists
    const appDir = join(projectPath, 'app');
    const newAppDir = join(srcDir, 'app');
    if (structure.usesAppRouter) {
      await mkdir(newAppDir, { recursive: true });
      // Note: actual moving would be handled by the backup manager
    }
  }

  // Ensure proper Next.js config
  const nextConfigPath = structure.nextConfig.path || join(projectPath, 'next.config.mjs');
  const nextConfigContent = `
import { withBauCMS } from '@baudevs/bau-cms-core/next-config';

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
    serverComponentsExternalPackages: ['@libsql/client'],
  },
};

export default withBauCMS(nextConfig);
`;

  return {
    nextConfigPath,
    nextConfigContent
  };
}

export async function initCommand(options: InitOptions = {}) {
  const spinner = ora('Analyzing your Next.js project...').start();

  try {
    // Analyze project structure
    const structure = await analyzeProject();
    spinner.succeed('Project analysis complete');

    // Validate project structure
    const issues = await validateProjectStructure(structure);

    if (issues.length > 0) {
      console.log(chalk.yellow('\nWarning: Your project structure has some issues:'));
      issues.forEach(issue => console.log(chalk.yellow(`- ${issue}`)));

      const { proceed } = await inquirer.prompt([{
        type: 'confirm',
        name: 'proceed',
        message: 'Would you like BauCMS to fix these issues?',
        default: true
      }]);

      if (!proceed) {
        console.log(chalk.red('Setup cancelled. Please fix the issues manually and try again.'));
        process.exit(1);
      }
    }

    // Initialize backup manager
    const backupManager = new BackupManager();
    await backupManager.initialize();

    // Start interactive setup
    console.log(chalk.blue('\nWelcome to BauCMS setup!'));
    console.log('\nProject details detected:');
    console.log(`- Using ${structure.usesSrcDirectory ? 'src/' : 'root'} directory`);
    console.log(`- Using ${structure.usesAppRouter ? 'App Router' : 'Pages Router'}`);
    console.log(`- Package manager: ${structure.packageManager}`);
    if (structure.usesI18n.enabled) {
      console.log(`- i18n: ${structure.usesI18n.library || 'configured'}`);
    }
    if (structure.existingMiddleware.exists) {
      console.log('- Existing middleware detected');
    }

    // @ts-ignore - Inquirer types are not perfect, but the runtime works correctly
    const answers = await inquirer.prompt<SetupAnswers>([
      {
        type: 'confirm',
        name: 'enforceStructure',
        message: 'Would you like BauCMS to enforce its recommended project structure?',
        default: true,
      },
      {
        type: 'list',
        name: 'databaseType',
        message: 'Which type of database would you like to use?',
        choices: [
          { name: 'Local SQLite (Recommended for development)', value: 'local' },
          { name: 'Turso (Recommended for production)', value: 'turso' }
        ]
      },
      {
        type: 'input',
        name: 'databasePath',
        message: 'Where would you like to store your database file?',
        default: './content.db',
        when: (answers: Partial<SetupAnswers>) => answers.databaseType === 'local'
      },
      {
        type: 'input',
        name: 'tursoUrl',
        message: 'Enter your Turso database URL:',
        when: (answers: Partial<SetupAnswers>) => answers.databaseType === 'turso',
        validate: (input: string) => input.length > 0 || 'Database URL is required'
      },
      {
        type: 'input',
        name: 'tursoAuthToken',
        message: 'Enter your Turso authentication token:',
        when: (answers: Partial<SetupAnswers>) => answers.databaseType === 'turso',
        validate: (input: string) => input.length > 0 || 'Auth token is required'
      },
      {
        type: 'confirm',
        name: 'setupAuth',
        message: 'Would you like to set up authentication with Clerk? (Recommended)',
        default: true,
      },
      {
        type: 'confirm',
        name: 'setupAdminUI',
        message: 'Would you like to set up the admin UI? (Recommended)',
        default: true,
      },
      {
        type: 'checkbox',
        name: 'selectedTemplates',
        message: 'Which content templates would you like to use?',
        choices: [
          { name: 'Page (Basic page)', value: 'page', checked: true },
          { name: 'Blog Post (with /blog routing)', value: 'blog-post' },
          { name: 'Service (with /services routing)', value: 'service' },
          { name: 'Product (with /products routing)', value: 'product' }
        ],
        validate: (input: string[]) => input.length > 0 || 'Please select at least one template'
      },
      {
        type: 'confirm',
        name: 'i18n',
        message: 'Would you like to enable internationalization (i18n)?',
        default: structure.usesI18n.enabled,
        when: !structure.usesI18n.enabled
      },
      {
        type: 'list',
        name: 'i18nLibrary',
        message: 'Which i18n library would you like to use?',
        choices: [
          { name: 'next-intl (Recommended)', value: 'next-intl' },
          { name: 'next-i18next', value: 'next-i18next' }
        ],
        when: (answers: Partial<SetupAnswers>) => answers.i18n && !structure.usesI18n.enabled
      }
    ]);

    spinner.start('Setting up BauCMS...');

    // Setup project structure if requested
    if (answers.enforceStructure) {
      const { nextConfigPath, nextConfigContent } = await setupProjectStructure(process.cwd(), structure);
      await writeFile(nextConfigPath, nextConfigContent);
      await backupManager.trackChange(nextConfigPath, nextConfigContent, structure.nextConfig.path ? 'modify' : 'create');
    }

    // Create necessary directories based on project structure
    const baseDir = answers.enforceStructure || structure.usesSrcDirectory ? 'src' : '';
    const apiDir = join(baseDir, 'app', 'api', 'baucms');
    const adminDir = join(baseDir, 'app', 'admin');

    await mkdir(apiDir, { recursive: true });
    if (answers.setupAdminUI) {
      await mkdir(adminDir, { recursive: true });
    }

    // Create API route with configuration
    const databaseConfig = answers.databaseType === 'local'
      ? `{ type: 'local', url: 'file:${answers.databasePath}' }`
      : `{ type: 'turso', url: '${answers.tursoUrl}', authToken: '${answers.tursoAuthToken}' }`;

    const apiRoute = `
import { initBauCMS } from '@baudevs/bau-cms-core';
${answers.setupAuth ? "import { auth } from '@clerk/nextjs/server';" : ''}

export const { GET, POST, PUT, DELETE } = initBauCMS({
  database: ${databaseConfig},
  ${answers.setupAuth ? 'auth,' : ''}
  templates: {
    ${answers.selectedTemplates.includes('page') ? 'page: true,' : ''}
    ${answers.selectedTemplates.includes('blog-post') ? 'blogPost: true,' : ''}
    ${answers.selectedTemplates.includes('service') ? 'service: true,' : ''}
    ${answers.selectedTemplates.includes('product') ? 'product: true,' : ''}
  }
});
`;

    await writeFile(join(apiDir, 'route.ts'), apiRoute);
    await backupManager.trackChange(join(apiDir, 'route.ts'), apiRoute, 'create');

    // Create admin page if requested
    if (answers.setupAdminUI) {
      const adminPage = `
import { AdminLayout } from '@baudevs/bau-cms-editor';
${answers.setupAuth ? "import { auth } from '@clerk/nextjs/server';" : ''}

export default function AdminPage() {
  return (
    <AdminLayout>
      <h1>Welcome to BauCMS Admin</h1>
    </AdminLayout>
  );
}
`;
      await writeFile(join(adminDir, 'page.tsx'), adminPage);
      await backupManager.trackChange(join(adminDir, 'page.tsx'), adminPage, 'create');
    }

    // Handle middleware setup
    if (answers.setupAuth) {
      const middlewarePath = join(baseDir, 'middleware.ts');
      let middlewareContent: string;

      if (structure.existingMiddleware.exists && structure.existingMiddleware.content) {
        // Integrate with existing middleware
        middlewareContent = await integrateWithExistingMiddleware(
          structure.existingMiddleware.content,
          structure.existingMiddleware.path || middlewarePath
        );
      } else {
        // Create new middleware
        middlewareContent = `
import { authMiddleware } from '@clerk/nextjs/server';

export default authMiddleware({
  publicRoutes: ["/api/baucms(.*)"],
});

export const config = {
  matcher: ['/(api|admin)(.*)'],
};
`;
      }

      await writeFile(middlewarePath, middlewareContent);
      await backupManager.trackChange(middlewarePath, middlewareContent, structure.existingMiddleware.exists ? 'modify' : 'create');
    }

    // Update package.json with required dependencies
    const packageJsonPath = join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));

    const dependencies = {
      '@baudevs/bau-cms-core': 'latest',
      ...(answers.setupAdminUI && { '@baudevs/bau-cms-editor': 'latest' }),
      ...(answers.setupAuth && { '@clerk/nextjs': '^6.0.0' }),
      ...(answers.i18n && { [answers.i18nLibrary || 'next-intl']: 'latest' })
    };

    packageJson.dependencies = {
      ...packageJson.dependencies,
      ...dependencies
    };

    await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
    await backupManager.trackChange(packageJsonPath, JSON.stringify(packageJson, null, 2), 'modify');

    // Save changes summary
    const summary = await backupManager.getChangeSummary();
    await writeFile('.bau-changes.md', summary);

    spinner.succeed('BauCMS has been set up successfully!');

    console.log('\nNext steps:');
    console.log('1. Install dependencies with: ' + chalk.cyan(`${structure.packageManager} install`));
    console.log('2. Run ' + chalk.cyan('bau migrate') + ' to set up your database');
    if (answers.setupAuth) {
      console.log('3. Add your Clerk environment variables to .env.local:');
      console.log('   ' + chalk.cyan('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key'));
      console.log('   ' + chalk.cyan('CLERK_SECRET_KEY=your_secret_key'));
    }
    if (answers.setupAdminUI) {
      console.log(`${answers.setupAuth ? '4' : '3'}. Visit ` + chalk.cyan('/admin') + ' to start managing your content');
    }

    console.log('\nA backup of all changes has been created in ' + chalk.cyan('.bau-backup'));
    console.log('To restore your project to its previous state, run: ' + chalk.cyan('bau restore'));

  } catch (error) {
    spinner.fail('Failed to set up BauCMS');
    if (error instanceof Error) {
      console.error(chalk.red(error.message));
      if (error.stack) {
        console.error(chalk.gray(error.stack));
      }
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}

async function integrateWithExistingMiddleware(existingContent: string, path: string): Promise<string> {
  // Simple integration strategy - add Clerk's matcher to existing matchers
  if (existingContent.includes('export const config')) {
    return existingContent.replace(
      /export const config\s*=\s*{([^}]*)}/,
      (match, group) => {
        const existingMatchers = group.includes('matcher')
          ? group.replace(/matcher:\s*\[(.*)\]/, '$1')
          : '';
        return `export const config = {
  matcher: [
    ${existingMatchers ? existingMatchers + ',' : ''}
    '/(api|admin)(.*)'
  ]
}`;
      }
    );
  }

  // If no existing config, append it
  return `${existingContent}

export const config = {
  matcher: ['/(api|admin)(.*)'],
};`;
}
