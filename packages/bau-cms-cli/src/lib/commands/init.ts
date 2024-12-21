import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

type Template = 'page' | 'blog-post' | 'service' | 'product';

interface SetupAnswers {
  databaseType: 'local' | 'turso';
  databasePath?: string;
  tursoUrl?: string;
  tursoAuthToken?: string;
  setupAuth: boolean;
  setupAdminUI: boolean;
  selectedTemplates: Template[];
}

export async function initCommand() {
  console.log(chalk.blue('Welcome to BauCMS setup!'));

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
    }
  ]);

  const spinner = ora('Setting up BauCMS...').start();

  try {
    // Create necessary directories
    await mkdir('app/api/baucms', { recursive: true });
    if (answers.setupAdminUI) {
      await mkdir('app/admin', { recursive: true });
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

    await writeFile('app/api/baucms/route.ts', apiRoute);

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
      await writeFile('app/admin/page.tsx', adminPage);
    }

    // Create middleware for Clerk if auth is enabled
    if (answers.setupAuth) {
      const middleware = `
import { authMiddleware } from '@clerk/nextjs/server';
 
export default authMiddleware({
  publicRoutes: ["/api/baucms(.*)"],
});
 
export const config = {
  matcher: ['/(api|admin)(.*)'],
};
`;
      await writeFile('middleware.ts', middleware);
    }

    spinner.succeed('BauCMS has been set up successfully!');
    
    console.log('\nNext steps:');
    console.log('1. Run ' + chalk.cyan('npx baucms migrate') + ' to set up your database');
    if (answers.setupAuth) {
      console.log('2. Add your Clerk environment variables to .env.local:');
      console.log('   ' + chalk.cyan('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key'));
      console.log('   ' + chalk.cyan('CLERK_SECRET_KEY=your_secret_key'));
    }
    if (answers.setupAdminUI) {
      console.log(`${answers.setupAuth ? '3' : '2'}. Visit ` + chalk.cyan('/admin') + ' to start managing your content');
    }
    
  } catch (error) {
    spinner.fail('Failed to set up BauCMS');
    console.error(error);
    process.exit(1);
  }
} 