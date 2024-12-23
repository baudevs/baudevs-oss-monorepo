import chalk from 'chalk';
import ora from 'ora';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { mkdir, cp } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function migrateCommand() {
  const spinner = ora('Setting up migrations...').start();

  try {
    // Ensure migrations directory exists
    const migrationsDir = join(process.cwd(), 'migrations');
    if (!existsSync(migrationsDir)) {
      await mkdir(migrationsDir, { recursive: true });
      
      // Copy migrations from core package
      const coreMigrationsPath = join(process.cwd(), 'node_modules/@baudevs/bau-cms-core/migrations');
      if (!existsSync(coreMigrationsPath)) {
        spinner.fail('Could not find migrations in @baudevs/bau-cms-core package');
        console.error('Please make sure @baudevs/bau-cms-core is installed');
        process.exit(1);
      }
      
      await cp(coreMigrationsPath, migrationsDir, { recursive: true });
    }

    spinner.text = 'Running database migrations...';

    // Check if database file exists, if not, create it
    const dbPath = join(process.cwd(), 'content.db');
    const client = createClient({
      url: `file:${dbPath}`,
    });

    const db = drizzle(client);

    // Run migrations
    await migrate(db, {
      migrationsFolder: migrationsDir,
    });

    spinner.succeed('Database migrations completed successfully!');
    
    console.log('\nNext steps:');
    console.log('1. Your database is now ready at: ' + chalk.cyan(dbPath));
    console.log('2. You can start adding content through the API or admin UI');
    
  } catch (error) {
    spinner.fail('Failed to run migrations');
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