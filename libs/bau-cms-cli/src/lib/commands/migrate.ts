import chalk from 'chalk';
import ora from 'ora';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';

export async function migrateCommand() {
  const spinner = ora('Running database migrations...').start();

  try {
    const client = createClient({
      url: 'file:content.db',
    });

    const db = drizzle(client);

    // Run migrations
    await migrate(db, {
      migrationsFolder: './node_modules/@baudevs/bau-cms-core/migrations',
    });

    spinner.succeed('Database migrations completed successfully!');
  } catch (error) {
    spinner.fail('Failed to run migrations');
    console.error(error);
    process.exit(1);
  }
} 