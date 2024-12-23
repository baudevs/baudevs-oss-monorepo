import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { mkdir, writeFile } from 'fs/promises';
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
}

export async function initCommand() {
  const spinner = ora('Analyzing your Next.js project...').start();
  
  try {
    // Analyze project structure
    const projectStructure = await analyzeProject();
    spinner.succeed('Project analysis complete');

    // Initialize backup manager
    const backupManager = new BackupManager();
    await backupManager.initialize();

    // Start interactive setup
    console.log(chalk.blue('\nWelcome to BauCMS setup!'));
    console.log('\nProject details detected:');
    console.log(`- Using ${projectStructure.usesSrcDirectory ? 'src/' : 'root'} directory`);
    console.log(`- Using ${projectStructure.usesAppRouter ? 'App Router' : 'Pages Router'}`);
    console.log(`- Package manager: ${projectStructure.packageManager}`);
    if (projectStructure.usesI18n.enabled) {
      console.log(`- i18n: ${projectStructure.usesI18n.library || 'configured'}`);
    }
    if (projectStructure.existingMiddleware.exists) {
      console.log('- Existing middleware detected');
    }

    const answers: SetupAnswers = await inquirer.prompt([
      {
        type: 'list',
        name: 'databaseType',
        message: 'Which type of database would you like to use?',
        choices: [
          { name: 'Local SQLite', value: 'local' },
          { name: 'Turso (Remote SQLite)', value: 'turso' }
        ]
      },
      {
        type: 'input',
        name: 'databasePath',
        message: 'Where would you like to store your database file?',
        default: './content.db',
        when: (answers) => answers.databaseType === 'local'
      },
      {
        type: 'input',
        name: 'tursoUrl',
        message: 'Enter your Turso database URL:',
        when: (answers) => answers.databaseType === 'turso',
        validate: (input) => input.length > 0 || 'Database URL is required'
      },
      {
        type: 'input',
        name: 'tursoAuthToken',
        message: 'Enter your Turso authentication token:',
        when: (answers) => answers.databaseType === 'turso',
        validate: (input) => input.length > 0 || 'Auth token is required'
      },
      {
        type: 'confirm',
        name: 'setupAuth',
        message: 'Would you like to set up authentication with Clerk?',
        default: true,
      },
      {
        type: 'confirm',
        name: 'setupAdminUI',
        message: 'Would you like to set up the admin UI? (accessible at /admin)',
        default: true,
      },
      {
        type: 'checkbox',
        name: 'selectedTemplates',
        message: 'Which content templates would you like to use?',
        choices: [
          { name: 'Page (Basic page)', value: 'page' },
          { name: 'Blog Post (with /blog routing)', value: 'blog-post' },
          { name: 'Service (with /services routing)', value: 'service' },
          { name: 'Product (with /products routing)', value: 'product' }
        ],
        validate: (input) => input.length > 0 || 'Please select at least one template'
      },
      {
        type: 'confirm',
        name: 'i18n',
        message: 'Would you like to enable internationalization (i18n)?',
        default: projectStructure.usesI18n.enabled,
        when: !projectStructure.usesI18n.enabled
      },
      {
        type: 'list',
        name: 'i18nLibrary',
        message: 'Which i18n library would you like to use?',
        choices: [
          { name: 'next-intl (Recommended)', value: 'next-intl' },
          { name: 'next-i18next', value: 'next-i18next' }
        ],
        when: (answers) => answers.i18n && !projectStructure.usesI18n.enabled
      }
    ]);

    spinner.start('Setting up BauCMS...');

    // Create necessary directories based on project structure
    const baseDir = projectStructure.usesSrcDirectory ? 'src' : '';
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

      if (projectStructure.existingMiddleware.exists && projectStructure.existingMiddleware.content) {
        // Integrate with existing middleware
        middlewareContent = await integrateWithExistingMiddleware(
          projectStructure.existingMiddleware.content,
          projectStructure.existingMiddleware.path || middlewarePath
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
      await backupManager.trackChange(middlewarePath, middlewareContent, projectStructure.existingMiddleware.exists ? 'modify' : 'create');
    }

    // Save changes summary
    const summary = await backupManager.getChangeSummary();
    await writeFile('.baucms-changes.md', summary);

    spinner.succeed('BauCMS has been set up successfully!');
    
    console.log('\nNext steps:');
    console.log('1. Run ' + chalk.cyan('baucms migrate') + ' to set up your database');
    if (answers.setupAuth) {
      console.log('2. Add your Clerk environment variables to .env.local:');
      console.log('   ' + chalk.cyan('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key'));
      console.log('   ' + chalk.cyan('CLERK_SECRET_KEY=your_secret_key'));
    }
    if (answers.setupAdminUI) {
      console.log(`${answers.setupAuth ? '3' : '2'}. Visit ` + chalk.cyan('/admin') + ' to start managing your content');
    }
    
    console.log('\nA backup of all changes has been created in ' + chalk.cyan('.baucms-backup'));
    console.log('To restore your project to its previous state, run: ' + chalk.cyan('baucms restore'));
    
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