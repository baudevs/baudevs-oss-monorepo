import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

export async function initCommand() {
  console.log(chalk.blue('Welcome to BauCMS setup!'));

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'databasePath',
      message: 'Where would you like to store your database file?',
      default: './content.db',
    },
    {
      type: 'confirm',
      name: 'setupAuth',
      message: 'Would you like to set up authentication with Clerk?',
      default: true,
    },
  ]);

  const spinner = ora('Setting up BauCMS...').start();

  try {
    // Create necessary directories
    await mkdir('app/api/baucms', { recursive: true });
    await mkdir('app/admin', { recursive: true });

    // Create API route
    const apiRoute = `
import { initBauCMS } from '@baudevs/bau-cms-core';

export const { GET, POST, PUT, DELETE } = initBauCMS({
  database: {
    url: 'file:${answers.databasePath}',
  },
});
`;

    await writeFile('app/api/baucms/route.ts', apiRoute);

    // Create admin page
    const adminPage = `
import { AdminLayout } from '@baudevs/bau-cms-admin';

export default function AdminPage() {
  return (
    <AdminLayout>
      <h1>Welcome to BauCMS Admin</h1>
    </AdminLayout>
  );
}
`;

    await writeFile('app/admin/page.tsx', adminPage);

    spinner.succeed('BauCMS has been set up successfully!');
    
    console.log('\nNext steps:');
    console.log('1. Run ' + chalk.cyan('npx baucms migrate') + ' to set up your database');
    console.log('2. Visit ' + chalk.cyan('/admin') + ' to start managing your content');
    
  } catch (error) {
    spinner.fail('Failed to set up BauCMS');
    console.error(error);
    process.exit(1);
  }
} 